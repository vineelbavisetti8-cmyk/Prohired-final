// Admin-only: list every user's resume and generate/serve an AI audit report
// describing drawbacks and missing essentials.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callGrok, safeJson } from "../_shared/grok.ts";

const ADMIN_NAME = "prohired@#+";

interface AuditReport {
  summary: string;
  verdict: "excellent" | "good" | "average" | "poor";
  overallScore: number;
  drawbacks: { title: string; severity: "critical" | "warning" | "minor"; detail: string; fix: string }[];
  missingEssentials: { item: string; why: string }[];
  missingKeywords: string[];
  sections: { name: string; present: boolean; quality: number; note: string }[];
  recommendations: string[];
}

const AUDIT_PROMPT = `You are a strict senior recruitment auditor reviewing a candidate resume for an internal admin quality report.
Return ONLY a valid JSON object (no markdown fences, no commentary) with this EXACT structure:
{
  "summary": string (3-4 sentences describing the overall state of the resume),
  "verdict": "excellent" | "good" | "average" | "poor",
  "overallScore": number 0-100,
  "drawbacks": [{ "title": string, "severity": "critical"|"warning"|"minor", "detail": string, "fix": string }],
  "missingEssentials": [{ "item": string, "why": string }],
  "missingKeywords": [string],
  "sections": [{ "name": string, "present": boolean, "quality": number 0-100, "note": string }],
  "recommendations": [string]
}
Check these sections at minimum: Contact Info, Professional Summary, Work Experience, Skills, Education, Projects, Certifications.
List at least 4 drawbacks and every genuinely missing essential. Be brutally honest and specific to the resume text.`;

function isAdmin(req: Request): boolean {
  const session = req.headers.get("x-admin-session");
  if (!session) return false;
  try {
    return atob(session).split(":")[0] === ADMIN_NAME;
  } catch {
    return false;
  }
}

async function generateAudit(resumeText: string): Promise<AuditReport> {
  const raw = await callGrok(AUDIT_PROMPT, resumeText.slice(0, 25000), { expectJson: true });
  return safeJson<AuditReport>(raw);
}

// @ts-ignore: Deno global
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-session",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(
    // @ts-ignore: Deno global
    Deno.env.get("SUPABASE_URL")!,
    // @ts-ignore: Deno global
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const { action, resumeId } = (await req.json()) as { action: string; resumeId?: string };

    if (action === "list") {
      const { data, error } = await admin
        .from("resumes")
        .select("id,user_id,file_name,ats_score,status,created_at,audited_at,audit_report,profiles:user_id(email,full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ resumes: data ?? [] });
    }

    if (action === "audit") {
      if (!resumeId) return json({ error: "resumeId required" }, 400);

      const { data: resume, error } = await admin
        .from("resumes")
        .select("id,original_text,rewritten_resume,audit_report")
        .eq("id", resumeId)
        .maybeSingle();
      if (error) throw error;
      if (!resume) return json({ error: "Resume not found" }, 404);

      const text = (resume.original_text || resume.rewritten_resume || "").trim();
      if (text.length < 50) return json({ error: "Resume has no readable text to audit" }, 400);

      const report = await generateAudit(text);
      const auditedAt = new Date().toISOString();

      const { error: upErr } = await admin
        .from("resumes")
        .update({ audit_report: report, audited_at: auditedAt })
        .eq("id", resumeId);
      if (upErr) throw upErr;

      return json({ report, audited_at: auditedAt });
    }

    if (action === "delete") {
      if (!resumeId) return json({ error: "resumeId required" }, 400);
      const { error } = await admin.from("resumes").delete().eq("id", resumeId);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "CREDITS_EXHAUSTED" ? 402 : 500;
    const userMsg =
      msg === "RATE_LIMIT"
        ? "Too many requests. Please try again in a minute."
        : msg === "CREDITS_EXHAUSTED"
        ? "Grok API credits exhausted. Please add credits in your xAI console."
        : msg;
    return json({ error: userMsg }, status);
  }
});