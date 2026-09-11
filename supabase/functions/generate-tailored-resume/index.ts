// Edge function: tailor a candidate's REAL resume content toward a specific
// target role/company, as structured JSON (never raw LaTeX — see
// src/lib/latexResumeTemplate.ts for why). One-pager, ATS-friendly, truthful.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.103.3/cors";
import { callGrok, safeJson } from "../_shared/grok.ts";

interface RequestBody {
  resumeText: string;
  targetRole: string;
  targetCompany?: string;
  focusAreas?: string; // e.g. "marketing campaigns, brand growth achievements, and creative skillsets"
}

const SYSTEM_PROMPT = `You are a senior full-stack resume-technology engineer AND a senior HR / talent-acquisition professional with 80+ years of combined experience screening resumes. A recruiter with your seniority has one rule above all others: NEVER let a candidate's application contain a single fabricated fact.

TASK: Given a candidate's real, existing resume content and a target job role (optionally a target company and focus areas), produce a ONE-PAGE, ATS-friendly tailoring of that SAME candidate's SAME real background — reordered, re-emphasized, and re-worded to speak directly to the target role. You are not writing a new resume; you are the world's best editor re-cutting a real resume's real footage for a specific audience.

ABSOLUTE TRUTHFULNESS RULES (violating any of these is a critical failure):
1. NEVER invent employers, job titles, dates, degrees, institutions, certifications, or metrics that are not already present in the candidate's resume text.
2. You MAY: reorder bullets, rewrite phrasing, choose stronger action verbs, surface the most role-relevant real achievements first, and tighten wording to fit one page.
3. You MAY quantify a bullet ONLY if a real number/percentage/scale already exists in the source text for that bullet — do not add numbers that aren't there.
4. If the source resume has no projects, return an empty projects array. If it has no certifications, return an empty certifications array. Never fill gaps with invented content.
5. The professional summary must be a truthful 3-4 sentence synthesis of the candidate's REAL background, written to position them for the target role — not a fictional pitch.
6. Preserve the candidate's real name, contact details, and links exactly as given.

Return ONLY a valid JSON object (no markdown fences, no commentary) with EXACTLY this shape:
{
  "name": string,
  "location": string | null,
  "phone": string | null,
  "email": string | null,
  "linkedin": string | null,
  "github": string | null,
  "portfolio": string | null,
  "summary": string,
  "skills": string[],
  "experience": [{ "title": string, "company": string, "location": string | null, "dates": string, "bullets": string[] }],
  "projects": [{ "name": string, "stack": string | null, "bullets": string[] }],
  "education": [{ "degree": string, "institution": string, "year": string | null }],
  "certifications": string[]
}
Order experience/education entries most-recent-first, matching the source. Keep total bullets tight enough to fit one page (roughly 3-4 bullets per role, prioritizing the ones most relevant to the target role).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { resumeText, targetRole, targetCompany, focusAreas } = (await req.json()) as RequestBody;

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Resume text is too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!targetRole || !targetRole.trim()) {
      return new Response(JSON.stringify({ error: "targetRole is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth check — this is a paid AI call, so require a signed-in user (same
    // pattern as analyze-resume), but no plan/count limit here yet: tailoring
    // an already-analyzed resume for a second role is a lighter action than a
    // fresh upload, and adding a per-plan cap is a easy follow-up if abused.
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

    const userPrompt = `TARGET ROLE: ${targetRole.trim()}
${targetCompany?.trim() ? `TARGET COMPANY: ${targetCompany.trim()}` : ""}
${focusAreas?.trim() ? `FOCUS AREAS TO SPOTLIGHT (only using real, existing content): ${focusAreas.trim()}` : ""}

CANDIDATE'S REAL RESUME CONTENT (the only source of truth — do not add facts not present here):
"""
${resumeText}
"""`;

    const raw = await callGrok(SYSTEM_PROMPT, userPrompt, { expectJson: true });
    const tailored = safeJson(raw);

    return new Response(JSON.stringify({ tailored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS_EXHAUSTED" ? 402 : 500;
    const userMsg =
      msg === "RATE_LIMIT"
        ? "Too many requests. Please try again in a minute."
        : msg === "CREDITS_EXHAUSTED"
        ? "Grok API credits exhausted. Please add credits in your xAI console."
        : msg;
    console.error("generate-tailored-resume error", e);
    return new Response(JSON.stringify({ error: userMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
