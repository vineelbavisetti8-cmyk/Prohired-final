// Edge function: AI-improve a single resume section
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.103.3/cors";
import { callGrok } from "../_shared/grok.ts";

interface Body {
  section: string;   // 'summary' | 'experience' | 'skills' | 'projects'
  content: string;
}

const SYSTEM_BY_SECTION: Record<string, string> = {
  summary: "You are a senior ATS resume expert. Rewrite the SUMMARY section in 3-4 powerful sentences. Use strong action verbs, quantify achievements, naturally include industry keywords. Third-person implied (no 'I'). Return PLAIN TEXT only — no markdown headers, no bullet points, no commentary.",
  experience: "You are a senior ATS resume expert. Rewrite these EXPERIENCE bullet points to be ATS-optimized: start each with a strong action verb, quantify with numbers/percentages where possible, add relevant keywords naturally. Return PLAIN TEXT bullet points only, one per line, each starting with '- '. No section headers, no commentary.",
  skills: "You are a senior ATS resume expert. Improve and expand this SKILLS list to include the most relevant technical and professional keywords for ATS matching. Return a single comma-separated line of skills only — no markdown, no commentary, no headers.",
  projects: "You are a senior ATS resume expert. Rewrite this PROJECT description to be impact-driven: what was built, technologies used, measurable result. 2-3 sentences, plain text only. No headers, no bullets, no commentary.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { section, content } = (await req.json()) as Body;
    if (!section || !content?.trim()) {
      return new Response(JSON.stringify({ error: "section and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = SYSTEM_BY_SECTION[section] ?? SYSTEM_BY_SECTION.summary;
    const improved = (await callGrok(sys, content)).trim();
    return new Response(JSON.stringify({ improved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS_EXHAUSTED" ? 402 : 500;
    const userMsg =
      msg === "RATE_LIMIT"
        ? "Too many requests. Try again soon."
        : msg === "CREDITS_EXHAUSTED"
        ? "Grok API credits exhausted."
        : msg;
    console.error("improve-section error", e);
    return new Response(JSON.stringify({ error: userMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
