import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Loader2,
  FileDown,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Wand2,
  Target,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { downloadAsPDF } from "@/lib/resumeExport";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeRecord, Weakness, JobMatch } from "@/types";
import { toast } from "sonner";
import { TailorResumeDialog } from "@/components/TailorResumeDialog";
import AppSubNav, { SubNavTab } from "@/components/app/AppSubNav";
import { isValidUuid } from "@/lib/utils";

const SUB_TABS: SubNavTab[] = [
  { id: "overview", label: "ATS Score & Breakdown", icon: BarChart3 },
  { id: "improvements", label: "Weaknesses & Keywords", icon: AlertTriangle },
  { id: "matches", label: "Job Matches", icon: Briefcase },
  { id: "rewritten", label: "AI Rewritten Resume", icon: Sparkles },
];

export default function ResumeAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    (async () => {
      let found: any = null;

      // 1. Check local storage first (handles resume_* IDs seamlessly without network requests)
      try {
        const localList = JSON.parse(
          localStorage.getItem("prohired_local_resumes") ||
          localStorage.getItem("hirerapid_local_resumes") ||
          "[]"
        );
        found = localList.find((r: any) => r.id === id);
        if (!found && id.startsWith("resume_") && localList.length > 0) {
          found = localList[0];
        }
      } catch {
        // ignore
      }

      // 2. If not found locally and id is a valid UUID, query Supabase
      if (!found && isValidUuid(id)) {
        try {
          const { data } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
          found = data;
        } catch {
          // ignore
        }
      }

      // 3. Fallback to first available local resume if still not found
      if (!found) {
        try {
          const localList = JSON.parse(
            localStorage.getItem("prohired_local_resumes") ||
            localStorage.getItem("hirerapid_local_resumes") ||
            "[]"
          );
          if (localList.length > 0) {
            found = localList[0];
          }
        } catch {
          // ignore
        }
      }

      setResume(found as unknown as ResumeRecord | null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-1/3 bg-gray-100" />
        <Skeleton className="h-64 w-full bg-gray-100 rounded-2xl" />
        <Skeleton className="h-40 w-full bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">No Resume Found</h2>
        <p className="text-xs text-gray-500">
          We couldn't locate this resume. Please upload or try the sample resume.
        </p>
        <Button
          onClick={() => navigate("/app/resume/upload")}
          className="bg-orange-500 text-white rounded-xl text-xs"
        >
          Go to Resume Scanner
        </Button>
      </div>
    );
  }

  const score = resume.ats_score ?? 86;
  const breakdown = resume.score_breakdown ?? { content: 88, keywords: 82, format: 90, quantification: 84 };
  const weaknesses = resume.weaknesses ?? [];
  const matches = resume.job_matches ?? [];

  const handleDownload = () => {
    if (!resume?.rewritten_resume) {
      toast.error("No rewritten content to download");
      return;
    }
    const baseName = resume.file_name.replace(/\.[^.]+$/, "");
    downloadAsPDF(resume.rewritten_resume, baseName);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-App Navigation */}
      <AppSubNav
        tabs={SUB_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/resume/upload")}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                {resume.file_name}
              </p>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                ATS Diagnostic & Readiness Report
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-gray-300 bg-gray-50/80 hover:bg-gray-100 text-gray-800 text-xs rounded-xl h-9"
              >
                <Link to={`/app/resume/${resume.id}/builder`}>
                  <Wand2 className="h-3.5 w-3.5 mr-1 text-orange-600 shrink-0" /> Edit in Builder
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="border-gray-300 bg-gray-50/80 hover:bg-gray-100 text-gray-800 text-xs rounded-xl h-9"
              >
                <FileDown className="h-3.5 w-3.5 mr-1 text-orange-500 shrink-0" /> Export PDF
              </Button>
            </div>
            <TailorResumeDialog
              resumeText={resume.rewritten_resume ?? resume.original_text ?? ""}
              candidateName={resume.file_name.replace(/\.[^.]+$/, "")}
              defaultRole={matches[0]?.role}
              trigger={
                <Button variant="hero" className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10 px-3.5 font-semibold">
                  <Wand2 className="h-4 w-4 mr-1.5 shrink-0" /> Tailor Resume (AI + LaTeX)
                </Button>
              }
            />
          </div>
        </div>

        {/* TAB 1: OVERVIEW & BREAKDOWN */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Score Gauge */}
              <div className="glass-card flex flex-col items-center justify-center p-6 text-center">
                <ScoreRing score={score} />
                <div className="mt-3">
                  <span className="text-sm font-bold text-foreground">ATS Pass Probability</span>
                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                    {score >= 80 ? "✓ High Chance of Interview Call" : "Moderate - Apply Fixes"}
                  </p>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="glass-card lg:col-span-2 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">Pillar Score Breakdown</h3>
                  <span className="text-xs text-gray-500 font-medium">Benchmark: 75+ required</span>
                </div>

                <div className="space-y-4 pt-1">
                  <Bar label="Content Relevance & Impact" value={breakdown.content} />
                  <Bar label="Tech Stack & Keyword Density" value={breakdown.keywords} />
                  <Bar label="ATS Parser Layout & Typography" value={breakdown.format} />
                  <Bar label="Measurable Business Metrics" value={breakdown.quantification} />
                </div>
              </div>
            </div>

            {/* Quick Strengths strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strongest Selling Points
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(resume.strengths && resume.strengths.length > 0
                    ? resume.strengths
                    : ["Strong Tech Stack Alignment", "Clean Chronological Structure", "Action-Oriented Verbs"]
                  ).map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600" /> Priority Keywords Missing
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(resume.missing_keywords && resume.missing_keywords.length > 0
                    ? resume.missing_keywords
                    : ["System Architecture", "Microservices", "Docker", "CI/CD"]
                  ).map((k, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800"
                    >
                      + {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMPROVEMENTS & KEYWORDS */}
        {activeTab === "improvements" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-foreground">Specific ATS Improvement Recommendations</h3>
            <div className="space-y-3">
              {weaknesses.length === 0 ? (
                <div className="glass-card p-6 text-center text-gray-500 text-xs">
                  No critical weaknesses detected in this scan!
                </div>
              ) : (
                weaknesses.map((w, i) => <WeaknessCard key={i} w={w} />)
              )}
            </div>
          </div>
        )}

        {/* TAB 3: JOB MATCHES */}
        {activeTab === "matches" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Matched Indian Tech Roles</h3>
                <p className="text-xs text-gray-500">Roles where your current resume will rank in the top 10%.</p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/app/jobs")}
                className="bg-orange-500 text-white rounded-xl text-xs"
              >
                Browse All Openings <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((m, i) => (
                <MatchCard key={i} m={m} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REWRITTEN RESUME */}
        {activeTab === "rewritten" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">AI-Optimized ATS Ready Markdown</h3>
                <p className="text-xs text-gray-500">Rewritten with maximum quantifiable impact & keyword density.</p>
              </div>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-orange-500 text-white rounded-xl text-xs"
              >
                <FileDown className="h-3.5 w-3.5 mr-1" /> Export as PDF
              </Button>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <article className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-800 leading-relaxed break-words">
                <ReactMarkdown>{resume.rewritten_resume ?? resume.original_text ?? ""}</ReactMarkdown>
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const dur = 800;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setAnimated(Math.round(score * p));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [score]);

  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#F43F5E";
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (animated / 100) * c;

  return (
    <svg width="170" height="170" viewBox="0 0 170 170" className="drop-shadow-sm">
      <circle cx="85" cy="85" r={r} stroke="#E2E8F0" strokeWidth="12" fill="none" />
      <circle
        cx="85"
        cy="85"
        r={r}
        stroke={color}
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 85 85)"
        style={{ transition: "stroke 0.3s" }}
      />
      <text
        x="85"
        y="82"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontWeight: 800, fontSize: 38, fill: "#0F172A" }}
      >
        {animated}
      </text>
      <text
        x="85"
        y="110"
        textAnchor="middle"
        style={{ fontSize: 11, fill: "#64748B", fontWeight: 700 }}
      >
        / 100
      </text>
    </svg>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const color = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full ${color} transition-all duration-700 rounded-full`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

function WeaknessCard({ w }: { w: Weakness }) {
  const meta = {
    critical: { Icon: AlertCircle, label: "Critical", cls: "border-rose-200 bg-rose-50 text-rose-700" },
    warning: { Icon: AlertTriangle, label: "Warning", cls: "border-amber-300 bg-amber-50 text-amber-800" },
    suggestion: { Icon: Lightbulb, label: "Suggestion", cls: "border-orange-200 bg-orange-50 text-orange-800" },
  }[w.severity];
  const I = meta.Icon;

  return (
    <div className="glass-card p-4 rounded-2xl">
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${meta.cls}`}>
          <I className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.cls}`}>
              {meta.label}
            </span>
          </div>
          <h4 className="mt-1.5 text-xs sm:text-sm font-bold text-foreground">{w.issue}</h4>
          <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{w.suggestion}</p>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ m }: { m: JobMatch }) {
  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-foreground">{m.role}</h4>
            <p className="mt-0.5 text-xs text-orange-600 font-semibold">{m.salaryRangeIndia}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-orange-300 font-bold text-xs text-white shadow-glow-primary">
            {m.matchPercent}%
          </div>
        </div>
        <p className="mt-2.5 text-xs text-gray-600 leading-relaxed">{m.reasoning}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {m.skillsNeeded.map((s) => (
            <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button asChild size="sm" className="w-full bg-orange-500 hover:bg-orange-500 text-white rounded-xl text-xs">
          <Link to={`/app/jobs`}>
            <Briefcase className="h-3.5 w-3.5 mr-1" /> View Available Jobs
          </Link>
        </Button>
      </div>
    </div>
  );
}
