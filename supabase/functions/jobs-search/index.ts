// Edge function: search live jobs via Adzuna (India, last 7 days)
declare const Deno: any;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  salary_min?: number;
  salary_max?: number;
  description?: string;
  redirect_url?: string;
  created?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const what = url.searchParams.get("what") ?? "";
    const where = url.searchParams.get("where") ?? "";
    const page = url.searchParams.get("page") ?? "1";

    const appId = Deno.env.get("ADZUNA_APP_ID");
    const appKey = Deno.env.get("ADZUNA_APP_KEY") || "629acfd5bde2e3f3a5f871dc7ef22361";

    if (!appId || !appKey) {
      // Graceful fallback with demo jobs so UI always renders
      return new Response(
        JSON.stringify({
          mock: true,
          message: "Adzuna not configured — showing sample jobs",
          jobs: mockJobs(what),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: "20",
      max_days_old: "7",
      "content-type": "application/json",
    });
    if (what) params.set("what", what);
    if (where) params.set("where", where);

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?${params.toString()}`;
    const r = await fetch(adzunaUrl);

    if (!r.ok) {
      const txt = await r.text();
      console.error("Adzuna error", r.status, txt);
      return new Response(
        JSON.stringify({
          mock: true,
          message: `Adzuna API error (${r.status}). Showing sample jobs.`,
          jobs: mockJobs(what),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await r.json();
    const jobs = (data.results as AdzunaJob[] ?? []).map((j) => ({
      id: String(j.id),
      title: j.title,
      company: j.company?.display_name ?? "Unknown",
      location: j.location?.display_name ?? "",
      salaryMin: j.salary_min ?? null,
      salaryMax: j.salary_max ?? null,
      description: stripHtml(j.description ?? "").slice(0, 280),
      applyUrl: j.redirect_url ?? "",
      postedDate: j.created ?? "",
    }));

    return new Response(JSON.stringify({ mock: false, jobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("jobs-search exception", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function mockJobs(role: string) {
  const r = role || "Software Engineer";
  return [
    { id: "demo-1", title: `${r}`, company: "Acme Corp", location: "Bengaluru, India", salaryMin: 1200000, salaryMax: 2200000, description: "Join our team to build scalable systems used by millions. Strong fundamentals required.", applyUrl: "https://example.com", postedDate: new Date(Date.now() - 86400000).toISOString() },
    { id: "demo-2", title: `Senior ${r}`, company: "Northwind", location: "Hyderabad, India", salaryMin: 1800000, salaryMax: 3000000, description: "Senior role focused on architecture, mentorship, and high-impact delivery.", applyUrl: "https://example.com", postedDate: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "demo-3", title: `${r} (Remote)`, company: "Globex", location: "Remote, India", salaryMin: 900000, salaryMax: 1600000, description: "Fully remote opportunity. Flexible hours, modern stack, global team.", applyUrl: "https://example.com", postedDate: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: "demo-4", title: `Lead ${r}`, company: "Initech", location: "Pune, India", salaryMin: 2500000, salaryMax: 4000000, description: "Lead a team of engineers shipping product features end to end.", applyUrl: "https://example.com", postedDate: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: "demo-5", title: `Junior ${r}`, company: "Soylent", location: "Mumbai, India", salaryMin: 600000, salaryMax: 1000000, description: "Great launchpad for early career engineers. Pair programming culture.", applyUrl: "https://example.com", postedDate: new Date(Date.now() - 5 * 86400000).toISOString() },
  ];
}
