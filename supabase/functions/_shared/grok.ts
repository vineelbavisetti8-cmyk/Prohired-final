// Shared xAI Grok API client for all edge functions.
//
// Requires the GROK_API_KEY secret (get one at https://console.x.ai):
//   supabase secrets set GROK_API_KEY=xai-...
//
// Optionally override the model via the GROK_MODEL secret. Defaults below to
// a current fast/general-purpose Grok model — check https://docs.x.ai/docs/models
// for the latest names if xAI renames or retires this one.
const GROK_URL = "https://api.x.ai/v1/chat/completions";
const DEFAULT_GROK_MODEL = "grok-4-fast-non-reasoning";

export class GrokRateLimitError extends Error { constructor() { super("RATE_LIMIT"); } }
export class GrokCreditsError extends Error { constructor() { super("CREDITS_EXHAUSTED"); } }

/**
 * Call the Grok chat completions endpoint and return the raw text content.
 * Throws GrokRateLimitError / GrokCreditsError for 429 / 402 so callers can
 * keep their existing "RATE_LIMIT" / "CREDITS_EXHAUSTED" error-message
 * mapping unchanged.
 */
export async function callGrok(
  systemPrompt: string,
  userContent: string,
  opts: { expectJson?: boolean; model?: string } = {}
): Promise<string> {
  // @ts-ignore: Deno global
  const apiKey = Deno.env.get("GROK_API_KEY");
  if (!apiKey) throw new Error("GROK_API_KEY not configured");

  // @ts-ignore: Deno global
  const model = opts.model ?? Deno.env.get("GROK_MODEL") ?? DEFAULT_GROK_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  };
  if (opts.expectJson) body.response_format = { type: "json_object" };

  const r = await fetch(GROK_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (r.status === 429) throw new GrokRateLimitError();
  if (r.status === 402) throw new GrokCreditsError();
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Grok API error ${r.status}: ${text}`);
  }

  const data = await r.json();
  return (data.choices?.[0]?.message?.content as string) ?? "";
}

export function safeJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
