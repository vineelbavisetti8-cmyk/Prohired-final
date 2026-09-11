// Edge function: best-effort LaTeX -> PDF compile, so a user can get a PDF
// without leaving the app.
//
// IMPORTANT CAVEAT (do not remove this comment): Overleaf does not expose a
// public "compile my LaTeX and hand back a PDF" API — its documented
// integration only opens a project in the Overleaf editor for a human to hit
// Recompile (see src/lib/overleaf.ts). This function instead proxies to
// YtoTech's open-source "LaTeX-on-HTTP" service (latex.ytotech.com), a
// third-party compiler that runs a stock TeXLive image. It is best-effort:
// it can be slow, rate-limited, or briefly down. The frontend MUST always
// offer "Open in Overleaf" as the reliable fallback and never block on this.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.103.3/cors";

interface Body { latex: string }

const COMPILE_URL = "https://latex.ytotech.com/builds/sync";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { latex } = (await req.json()) as Body;
    if (!latex || latex.trim().length < 20) {
      return new Response(JSON.stringify({ error: "latex source is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const r = await fetch(COMPILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: "pdflatex",
        resources: [{ main: true, content: latex }],
      }),
    });

    if (!r.ok) {
      // Compiler rejected the source or the service itself is unavailable —
      // surface a clear reason so the UI can point the user to Overleaf.
      let detail = "";
      try { detail = await r.text(); } catch { /* ignore */ }
      return new Response(
        JSON.stringify({ error: "COMPILE_FAILED", detail: detail.slice(0, 2000) }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBuffer = await r.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    return new Response(JSON.stringify({ pdfBase64: base64 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compile-latex error", e);
    return new Response(
      JSON.stringify({ error: "COMPILE_FAILED", detail: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
