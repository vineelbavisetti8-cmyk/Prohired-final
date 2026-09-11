// Edge function: analyze a resume with the Grok (xAI) API.
// Returns rewritten resume + ATS analysis + job matches in one shot.
import { callGrok, safeJson } from "../_shared/grok.ts";

interface RequestBody {
  resumeText: string;
}

interface AnalysisResult {
  atsScore: number;
  breakdown: { content: number; keywords: number; format: number; quantification: number };
  weaknesses: { issue: string; severity: "critical" | "warning" | "suggestion"; suggestion: string }[];
  missingKeywords: string[];
  strengths: string[];
}

interface JobMatch {
  role: string;
  matchPercent: number;
  reasoning: string;
  skillsNeeded: string[];
  salaryRangeIndia: string;
}

const REWRITE_PROMPT = `You are a senior ATS resume expert and professional resume writer. Rewrite and optimize the candidate's resume to be 100% ATS-compliant and highly professional while being 100% TRUTHFUL.

STRICT ACCURACY & TRUTHFULNESS RULES:
1. DO NOT INVENT OR HALLUCINATE ANY FAKE DETAILS. Do NOT create fake company names, fake job titles, fake dates, fake degree titles, fake university names, or fake metrics that do not exist in the candidate's input.
2. PRESERVE ALL REAL CONTACT DETAILS & LINKS: Keep candidate's real Full Name, Email, Mobile/Phone, LinkedIn URL, GitHub URL, Portfolio URL, and Location.
3. PRESERVE CANDIDATE'S REAL BACKGROUND: Rewrite the candidate's actual work experience, actual projects, actual education, and actual certifications — never fabricate entries.
4. ATS OPTIMIZATION: start bullet points with strong action verbs (Led, Architected, Spearheaded, Developed, Optimized, Accelerated, Engineered), quantify impact wherever real numbers exist, and weave in relevant keywords naturally.

OUTPUT FORMAT — FOLLOW THIS EXACT MARKDOWN STRUCTURE (this is parsed programmatically, so structure matters as much as content):

# Candidate Full Name
Location | Phone | [email@example.com](mailto:email@example.com) | [LinkedIn](https://linkedin.com/in/...) | [GitHub](https://github.com/...)

## PROFESSIONAL SUMMARY
3-4 sentence, keyword-rich summary as a single plain paragraph (no bullets).

## TECHNICAL SKILLS
Comma-separated list of real skills/tools/technologies from the candidate's background (one line, no bullets, no sub-categories).

## PROFESSIONAL EXPERIENCE
### Job Title | Company Name | Location
_Month Year – Month Year_
- Achievement-driven bullet starting with an action verb, quantified if a real number exists.
- Second bullet.
(Repeat the "### Title | Company | Location" + "_Dates_" + bullet block for every real role, separated by a single blank line. Do NOT combine roles into one paragraph and never drop the "### " and "_..._" lines.)

## KEY PROJECTS
### Project Name | Tech Stack Used
- One or two impact-focused bullets. (Omit this whole section if the candidate has no real projects.)

## EDUCATION
### Degree Name | Institution Name
_Year_

## CERTIFICATIONS
- Certification Name — Issuer, Year (omit this whole section if none exist)

STRICT RULES:
- Every job/project/education entry MUST start with a "### " line. Never write experience as a flat paragraph or a single run-on bullet list without "### " entry headers.
- Keep formatting clean: no tables, no multi-column layout, no images, no icons, no emojis, no HTML.
- Use "## " only for the section names listed above, in that order (skip a section entirely if the candidate has nothing real for it — never invent content to fill it).
Return the complete rewritten resume in clean markdown format ONLY, following the structure above exactly. Do not include any preamble, explanation, or commentary before or after it.`;

const ANALYZE_PROMPT = `You are a professional ATS scoring system used by Fortune 500 HR departments. Analyze this resume and return ONLY a valid JSON object (no markdown, no explanation) with this EXACT structure:
{
  "atsScore": number 0-100,
  "breakdown": { "content": number, "keywords": number, "format": number, "quantification": number },
  "weaknesses": [{ "issue": string, "severity": "critical"|"warning"|"suggestion", "suggestion": string }],
  "missingKeywords": [string],
  "strengths": [string]
}
Be brutally honest. Most resumes score 45-70.`;

const MATCH_PROMPT = `You are a senior career counselor at a top recruitment firm. Based on this resume, identify the top 5 most realistic and suitable job roles for the Indian market. Return ONLY a valid JSON object with key "matches" containing an array, NO markdown:
{ "matches": [{ "role": string, "matchPercent": number 60-99, "reasoning": string (2 sentences), "skillsNeeded": [string], "salaryRangeIndia": string (e.g. "₹8-15 LPA") }] }
Order by match percentage descending. Be realistic, not optimistic.`;

// @ts-ignore: Deno global
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { resumeText } = (await req.json()) as RequestBody;
    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Resume text is too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth & Limit Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // @ts-ignore: Deno module
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const supabase = createClient(
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check plan and count (count includes the one currently being processed)
    const { data: profile } = await supabase.from("profiles").select("plan").single();
    if (profile?.plan !== "pro") {
      const { count } = await supabase.from("resumes").select("*", { count: "exact", head: true });
      if (count && count > 1) { // > 1 because the current resume is already inserted with status 'processing'
        return new Response(JSON.stringify({ error: "LIMIT_REACHED", message: "Free plan limit reached. Please upgrade to Pro." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Run the three AI calls in parallel for speed.
    const [rewriteRaw, analyzeRaw, matchRaw] = await Promise.all([
      callGrok(REWRITE_PROMPT, resumeText),
      callGrok(ANALYZE_PROMPT, resumeText, { expectJson: true }),
      callGrok(MATCH_PROMPT, resumeText, { expectJson: true }),
    ]);

    const analysis = safeJson<AnalysisResult>(analyzeRaw);
    const matchObj = safeJson<{ matches: JobMatch[] }>(matchRaw);

    return new Response(
      JSON.stringify({
        rewrittenResume: rewriteRaw.trim(),
        analysis,
        jobMatches: matchObj.matches ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS_EXHAUSTED" ? 402 : 500;
    const userMsg =
      msg === "RATE_LIMIT"
        ? "Too many requests. Please try again in a minute."
        : msg === "CREDITS_EXHAUSTED"
        ? "Grok API credits exhausted. Please add credits in your xAI console."
        : msg;
    return new Response(JSON.stringify({ error: userMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
