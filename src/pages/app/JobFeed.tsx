import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, RefreshCw, Bookmark, BookmarkCheck, ExternalLink,
  Clock, Sparkles, MapPin, Loader2, AlertTriangle, ChevronRight,
  Zap, Star, TrendingUp, Bell, CheckCircle2, FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ResumeRecord, JobMatch } from "@/types";
import { isValidUuid } from "@/lib/utils";
import { searchJobOpenings } from "@/lib/jobSearchService";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface FeedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  applyUrl: string;
  postedDate: string;
  role: string; // which skill/role triggered this
}

interface FeedCache {
  fetchedAt: string;        // ISO timestamp of last fetch
  jobs: FeedJob[];
  roles: string[];          // which roles were searched
  resumeScore: number;
}

const CACHE_KEY = (uid: string) => `prohired_daily_feed_${uid}`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function todayAt8AM(): Date {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
}

function isCacheStale(fetchedAt: string): boolean {
  const fetched = new Date(fetchedAt).getTime();
  const eightAM = todayAt8AM().getTime();
  const now = Date.now();
  // If it's past 8 AM today and the cache was fetched before today's 8 AM → stale
  if (now >= eightAM && fetched < eightAM) return true;
  // If cache is older than 24 h → stale
  if (now - fetched > 24 * 60 * 60 * 1000) return true;
  return false;
}

function nextRefreshLabel(fetchedAt: string): string {
  const next = new Date(todayAt8AM());
  if (Date.now() >= next.getTime()) next.setDate(next.getDate() + 1);
  const diff = next.getTime() - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min ?? max ?? 0);
}

function daysAgo(iso: string): string {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function JobFeed() {
  const { user, profile } = useAuth();
  const isPro = profile?.plan === "pro";

  const [cache, setCache] = useState<FeedCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [noResume, setNoResume] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [resumeScore, setResumeScore] = useState(0);

  /* Load saved jobs */
  useEffect(() => {
    if (!user) return;
    supabase.from("saved_jobs").select("external_job_id").eq("user_id", user.id)
      .then(({ data }) => setSavedIds(new Set((data ?? []).map(s => s.external_job_id))));
  }, [user]);

  /* ── Core fetch logic ── */
  const fetchFeed = useCallback(async (force = false) => {
    if (!user) return;
    const cacheKey = CACHE_KEY(user.id);

    // Try reading from localStorage
    if (!force) {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed: FeedCache = JSON.parse(raw);
          if (!isCacheStale(parsed.fetchedAt)) {
            setCache(parsed);
            setResumeScore(parsed.resumeScore ?? 0);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore corrupted cache */ }
    }

    setRefreshing(force);
    setLoading(!force);

    try {
      // 1. Load user's latest updated complete resume (from Supabase & LocalStorage)
      let allResumes: any[] = [];
      if (user?.id && isValidUuid(user.id)) {
        try {
          const { data } = await supabase
            .from("resumes")
            .select("id, user_id, ats_score, rewritten_resume, job_matches, missing_keywords, strengths, file_name, created_at, updated_at, status")
            .eq("user_id", user.id)
            .eq("status", "complete");
          if (data) allResumes = [...data];
        } catch {
          // ignore network failure
        }
      }

      try {
        const localList = JSON.parse(localStorage.getItem("prohired_local_resumes") || "[]");
        const localUserResumes = localList.filter((r: any) => (r.user_id === user.id || !r.user_id) && r.status === "complete");
        const existingIds = new Set(allResumes.map(r => r.id));
        for (const item of localUserResumes) {
          if (!existingIds.has(item.id)) {
            allResumes.push(item);
          } else {
            // Replace with local copy if local has newer updated_at
            const idx = allResumes.findIndex(r => r.id === item.id);
            const dbTime = new Date(allResumes[idx].updated_at || allResumes[idx].created_at || 0).getTime();
            const localTime = new Date(item.updated_at || item.created_at || 0).getTime();
            if (localTime >= dbTime) {
              allResumes[idx] = item;
            }
          }
        }
      } catch {
        // ignore
      }

      // Sort by latest updated_at or created_at
      allResumes.sort((a, b) => {
        const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });

      const latest = allResumes[0];

      if (!latest) {
        setNoResume(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const score = latest.ats_score ?? 0;
      setResumeScore(score);

      // 2. Extract top roles/skills from updated ATS resume data
      let jobMatches: JobMatch[] = latest.job_matches ?? [];
      
      // If jobMatches is empty or rewritten_resume was edited, extract roles directly from updated rewritten_resume text
      if (jobMatches.length === 0 && latest.rewritten_resume) {
        try {
          const { generateSmartResumeAnalysis } = await import("@/lib/smartResumeAnalyzer");
          const smart = generateSmartResumeAnalysis(latest.rewritten_resume, latest.file_name || "resume");
          jobMatches = smart.jobMatches;
        } catch {
          // ignore
        }
      }

      const topRoles = jobMatches
        .sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0))
        .slice(0, 4)
        .map(m => m.role)
        .filter(Boolean);

      const keywords: string[] = latest.missing_keywords ?? [];
      // Fallback: use top keyword clusters as search roles
      const keywordRoles = keywords.slice(0, 2);
      const searchRoles = topRoles.length > 0 ? topRoles : keywordRoles;

      if (searchRoles.length === 0) {
        setNoResume(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 3. Fetch jobs for each role (parallel)
      const jobBuckets = await Promise.allSettled(
        searchRoles.map(async (role) => {
          const results = await searchJobOpenings(role);
          const jobs = results.map(j => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            salaryMin: j.salaryMin ?? null,
            salaryMax: j.salaryMax ?? null,
            description: j.description,
            applyUrl: j.applyUrl ?? "",
            postedDate: new Date().toISOString(),
            role,
          })) as FeedJob[];
          return { role, jobs };
        })
      );

      const allJobs: FeedJob[] = [];
      const usedRoles: string[] = [];
      const seenIds = new Set<string>();

      jobBuckets.forEach(result => {
        if (result.status === "fulfilled") {
          usedRoles.push(result.value.role);
          result.value.jobs.forEach(j => {
            if (!seenIds.has(j.id)) {
              seenIds.add(j.id);
              allJobs.push(j);
            }
          });
        }
      });

      // Sort by most recent first
      allJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

      const newCache: FeedCache = {
        fetchedAt: new Date().toISOString(),
        jobs: allJobs,
        roles: usedRoles,
        resumeScore: score,
      };

      localStorage.setItem(CACHE_KEY(user.id), JSON.stringify(newCache));
      setCache(newCache);
      if (force) toast.success("Job feed refreshed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  /* ── Save / unsave ── */
  const toggleSave = async (job: FeedJob) => {
    if (!user) return;
    if (savedIds.has(job.id)) {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("external_job_id", job.id);
      setSavedIds(s => { const n = new Set(s); n.delete(job.id); return n; });
      toast.success("Removed from saved");
    } else {
      await supabase.from("saved_jobs").insert({
        user_id: user.id,
        external_job_id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        apply_url: job.applyUrl,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
      });
      setSavedIds(s => new Set(s).add(job.id));
      toast.success("Saved!");
    }
  };

  /* ── Filtered jobs ── */
  const filteredJobs = useMemo(() => {
    if (!cache) return [];
    if (filterRole === "all") return cache.jobs;
    return cache.jobs.filter(j => j.role === filterRole);
  }, [cache, filterRole]);

  const scoreColor = resumeScore >= 75 ? "text-success" : resumeScore >= 50 ? "text-gold" : "text-destructive";

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="container max-w-5xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── No resume state ── */
  if (noResume) {
    return (
      <div className="container max-w-5xl px-4 py-16 flex flex-col items-center text-center gap-5">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold">No resume found</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Upload and complete a resume analysis first. Your daily job feed is personalized from your skills and role matches.
          </p>
        </div>
        <Button asChild variant="hero" size="lg">
          <Link to="/app/resume/upload">Upload your resume <ChevronRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl px-4 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Daily at 8 AM
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-3xl font-extrabold">Your Job Feed</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Personalized from your resume skills · updated every morning
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Last refreshed */}
          {cache && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-surface-2 border border-border rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Updated {new Date(cache.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="mx-1 opacity-40 hidden sm:inline">·</span>
              <span className="hidden sm:inline">Next in {nextRefreshLabel(cache.fetchedAt)}</span>
            </div>
          )}
          <Button
            variant="soft"
            size="sm"
            onClick={() => fetchFeed(true)}
            disabled={refreshing}
            className="gap-1.5 shrink-0"
          >
            {refreshing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh now
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="glass-card p-3.5 sm:p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Your ATS Score
          </div>
          <div className={`font-display text-xl sm:text-2xl font-extrabold ${scoreColor}`}>
            {resumeScore}<span className="text-xs sm:text-sm font-normal text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="glass-card p-3.5 sm:p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Jobs Found
          </div>
          <div className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {cache?.jobs.length ?? 0}
          </div>
        </div>
        <div className="glass-card p-3.5 sm:p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Roles Matched
          </div>
          <div className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {cache?.roles.length ?? 0}
          </div>
        </div>
        <div className="glass-card p-3.5 sm:p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Saved
          </div>
          <div className="font-display text-xl sm:text-2xl font-extrabold text-primary">
            {savedIds.size}
          </div>
        </div>
      </div>

      {/* ── Role Filter Chips ── */}
      {cache && cache.roles.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" /> Matched roles from your resume
          </h2>
          <div className="scroll-x-mobile py-1">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                filterRole === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_hsl(var(--primary)/0.3)]"
                  : "bg-surface-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              All Roles
              <span className="ml-1.5 opacity-60">{cache.jobs.length}</span>
            </button>
            {cache.roles.map(role => {
              const count = cache.jobs.filter(j => j.role === role).length;
              return (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                    filterRole === role
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_hsl(var(--primary)/0.3)]"
                      : "bg-surface-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {role}
                  <span className="ml-1.5 opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ATS Gate Banner ── */}
      {resumeScore < 60 && (
        <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/8 p-4">
          <div className="h-9 w-9 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-gold">Boost your ATS score to unlock better matches</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your score is {resumeScore}/100. Employers prefer candidates with 75+. Improve your resume to see higher-paying, better-fit jobs.
            </p>
            <Button asChild variant="soft" size="sm" className="mt-2 gap-1.5">
              <Link to="/app/resume/upload">
                <Sparkles className="h-3.5 w-3.5" /> Improve my resume
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ── Job Feed Grid ── */}
      {filteredJobs.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">No jobs in this category</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try a different role filter or refresh the feed.</p>
          </div>
          <Button variant="soft" onClick={() => fetchFeed(true)} disabled={refreshing} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh feed
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {filterRole === "all" ? "All matched jobs" : `Jobs for "${filterRole}"`}
              <span className="text-sm font-normal text-muted-foreground">({filteredJobs.length})</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map(job => (
              <FeedJobCard
                key={`${job.id}-${job.role}`}
                job={job}
                saved={savedIds.has(job.id)}
                isPro={isPro}
                onSave={() => toggleSave(job)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Footer tip ── */}
      {cache && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-6">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          Feed auto-refreshes daily at 8:00 AM with jobs matching your resume skills.
          <button
            onClick={() => fetchFeed(true)}
            className="text-primary hover:underline font-semibold ml-auto whitespace-nowrap"
          >
            Refresh now
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Feed Job Card ──────────────────────────────────────────────────────── */
function FeedJobCard({
  job, saved, isPro, onSave,
}: {
  job: FeedJob;
  saved: boolean;
  isPro: boolean;
  onSave: () => void;
}) {
  const initial = job.company?.[0]?.toUpperCase() ?? "?";
  const salary = fmtSalary(job.salaryMin, job.salaryMax);
  const posted = job.postedDate ? daysAgo(job.postedDate) : null;

  return (
    <div className="glass-card flex flex-col p-5 gap-4 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_8px_32px_hsl(20_15%_2%/0.6)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 font-display text-base font-extrabold text-primary">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-bold leading-snug truncate">{job.title}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{job.company}</p>
        </div>
        <button
          onClick={onSave}
          aria-label={saved ? "Unsave" : "Save"}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-surface-2 hover:text-primary shrink-0"
        >
          {saved
            ? <BookmarkCheck className="h-5 w-5 text-primary" />
            : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {job.location && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />{job.location}
          </span>
        )}
        {salary && (
          <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 font-medium text-success">
            {salary}
          </span>
        )}
        {posted && (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">{posted}</span>
        )}
        <span className="ml-auto rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-bold text-primary text-[10px] uppercase tracking-wide">
          {job.role}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3 flex-1">
        {job.description}
      </p>

      {/* Apply CTA */}
      <div className="mt-auto">
        {isPro ? (
          <Button asChild variant="hero" size="sm" className="w-full h-10 gap-1.5">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply now <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        ) : (
          <Button asChild variant="soft" size="sm" className="w-full h-10 gap-1.5">
            <Link to="/app/profile">
              🔒 Upgrade to Apply
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
