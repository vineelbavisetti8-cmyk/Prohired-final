import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Trash2, ArrowRight, Loader2, Zap, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeRecord } from "@/types";
import { toast } from "sonner";
import { ProUpgradeDialog } from "@/components/ProGate";
import { isValidUuid } from "@/lib/utils";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const isPro = profile?.plan === "pro";

  const load = async () => {
    setLoading(true);
    let list: ResumeRecord[] = [];

    // Query Supabase only if user is logged in with a real UUID
    if (user?.id && isValidUuid(user.id)) {
      try {
        const { data } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) list = data as unknown as ResumeRecord[];
      } catch {
        // ignore
      }
    }

    try {
      const localList = JSON.parse(
        localStorage.getItem("prohired_local_resumes") ||
        localStorage.getItem("hirerapid_local_resumes") ||
        "[]"
      );
      const localFiltered = localList.filter((r: any) => !user || r.user_id === user.id || !r.user_id);
      const ids = new Set(list.map((r) => r.id));
      for (const item of localFiltered) {
        if (!ids.has(item.id)) list.push(item);
      }
    } catch {
      // ignore
    }

    setResumes(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume? This cannot be undone.")) return;

    if (isValidUuid(id)) {
      try {
        await supabase.from("resumes").delete().eq("id", id);
      } catch {
        // ignore
      }
    }

    try {
      const localList = JSON.parse(
        localStorage.getItem("prohired_local_resumes") ||
        localStorage.getItem("hirerapid_local_resumes") ||
        "[]"
      );
      const updated = localList.filter((r: any) => r.id !== id);
      localStorage.setItem("prohired_local_resumes", JSON.stringify(updated));
    } catch {}

    toast.success("Resume deleted");
    setResumes((r) => r.filter((x) => x.id !== id));
  };

  const bestScore = resumes.reduce((m, r) => Math.max(m, r.ats_score ?? 0), 0);
  const greeting = greet();
  const atFreeLimit = !isPro && resumes.length >= 1;

  const handleNewResume = (e: React.MouseEvent) => {
    if (atFreeLimit) {
      e.preventDefault();
      setUpgradeOpen(true);
    }
  };

  return (
    <div className="container max-w-6xl px-4 py-6 sm:py-8 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-3xl font-extrabold">
            {greeting}, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button asChild variant="hero" size="lg" className="h-12 w-full sm:w-auto">
          <Link to="/app/resume/upload" onClick={handleNewResume}>
            <Plus className="h-4 w-4" /> {atFreeLimit ? "Upgrade for more" : "New resume analysis"}
          </Link>
        </Button>
      </div>

      <div className="mt-6 sm:mt-7 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Resumes analyzed" value={resumes.length} />
        <StatCard label="Best ATS score" value={bestScore || "—"} accent />
        <StatCard label="Plan" value={profile?.plan === "pro" ? "Pro" : "Free"} />
      </div>

      {/* Daily Feed Discovery Card */}
      {bestScore >= 60 && (
        <div className="glass-card mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 border-primary/25 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display font-bold text-sm">Your Daily Job Feed is ready</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary">
                  <Bell className="h-2.5 w-2.5" /> 8 AM daily
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fresh jobs matched to your resume skills — updated every morning at 8 AM.
              </p>
            </div>
          </div>
          <Button asChild variant="hero" size="sm" className="w-full sm:w-auto shrink-0 gap-1.5 whitespace-nowrap">
            <Link to="/app/job-feed">
              <Zap className="h-3.5 w-3.5" /> View feed <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold">Your resumes</h2>
        <div className="mt-4 space-y-3">
          {loading && (
            <>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </>
          )}

          {!loading && resumes.length === 0 && (
            <div className="glass-card flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">No resumes yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Upload your first resume to get an instant ATS score and AI-rewritten version.
              </p>
              <Button asChild variant="hero" size="lg" className="mt-5">
                <Link to="/app/resume/upload">Upload resume</Link>
              </Button>
            </div>
          )}

          {!loading && resumes.map((r) => (
            <div key={r.id} className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{r.file_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {r.status === "processing" && <span className="ml-2 inline-flex items-center gap-1 text-primary"><Loader2 className="h-3 w-3 animate-spin" /> Processing</span>}
                    {r.status === "error" && <span className="ml-2 text-destructive">Failed</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.ats_score != null && <ScoreBadge score={r.ats_score} />}
                <Button asChild variant="soft" size="sm">
                  <Link to={`/app/resume/${r.id}/analysis`}>View <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to={`/app/resume/${r.id}/builder`}>Edit</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProUpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="multiple resumes" />
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="glass-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-extrabold ${accent ? "gradient-text" : ""}`}>{value}</div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-success border-success/40 bg-success/10" : score >= 50 ? "text-gold border-gold/40 bg-gold/10" : "text-destructive border-destructive/40 bg-destructive/10";
  return <div className={`rounded-full border px-2.5 py-1 text-xs font-bold ${color}`}>{score}/100</div>;
}
