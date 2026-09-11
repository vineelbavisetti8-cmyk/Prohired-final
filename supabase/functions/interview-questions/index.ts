// Edge function: generate interview questions for a role + difficulty
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.103.3/cors";
import { callGrok, safeJson } from "../_shared/grok.ts";

interface Body {
  role: string;
  difficulty: "easy" | "medium" | "hard";
}

const SYSTEM = `You are a senior hiring manager at a top tech company. Generate exactly 10 interview questions for the role and difficulty given. Return ONLY a valid JSON object with key "questions" containing an array, NO markdown:
{ "questions": [{ "id": "q1"-"q10", "question": string, "idealAnswer": string (3-4 sentences), "tips": string (1-2 sentences) }] }
Make questions specific, realistic, and progressively harder.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { role, difficulty } = (await req.json()) as Body;
    if (!role || !difficulty) {
      return new Response(JSON.stringify({ error: "role and difficulty are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = await callGrok(SYSTEM, `Role: ${role}\nDifficulty: ${difficulty}`, { expectJson: true });
    const parsed = safeJson<{ questions?: unknown[] }>(raw);

    return new Response(JSON.stringify({ questions: parsed.questions ?? [] }), {
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
    return new Response(JSON.stringify({ error: userMsg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
