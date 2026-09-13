import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  FileCheck,
  Briefcase,
  MessageSquare,
  Zap,
  Crown,
  CheckCircle2,
  TrendingUp,
  Target,
  Flame,
  ShieldCheck,
  Star,
  ChevronRight,
  HelpCircle,
  Play,
  Layers,
  Award,
  Upload,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AppSubNav, { SubNavTab } from "@/components/app/AppSubNav";
import { ProUpgradeDialog } from "@/components/ProGate";

const SUB_TABS: SubNavTab[] = [
  { id: "overview", label: "Cockpit", icon: Target },
  { id: "features", label: "App Features", icon: Layers },
  { id: "workflow", label: "How It Works", icon: Play },
  { id: "pricing", label: "Pro Membership", icon: Crown },
  { id: "faq", label: "Help & FAQ", icon: HelpCircle },
];

export default function AppExplore() {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile, streakDays, aiCredits } = useAuth();
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const isPro = profile?.plan === "pro";

  const [resumes, setResumes] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    try {
      const list = JSON.parse(
        localStorage.getItem("prohired_local_resumes") ||
        localStorage.getItem("hirerapid_local_resumes") ||
        "[]"
      );
      setResumes(list);
    } catch {}

    try {
      const saved = JSON.parse(
        localStorage.getItem("prohired_saved_job_ids") ||
        localStorage.getItem("hirerapid_saved_job_ids") ||
        "[]"
      );
      setSavedCount(saved.length);
    } catch {}
  }, []);

  const latestResume = resumes[0];
  const bestScore = resumes.reduce((m, r) => Math.max(m, r.ats_score ?? 0), 0);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-App Navigation Header */}
      <AppSubNav
        tabs={SUB_TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      {/* Screen Body */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 sm:py-7 space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero App Cockpit Card */}
            <div className="relative overflow-hidden rounded-3xl border border-orange-400/40 bg-gradient-to-br from-orange-100/60 via-white/90 to-gray-50 p-5 sm:p-7 shadow-2xl">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-orange-50 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-400/40 px-3 py-1 text-xs font-semibold text-orange-500">
                    <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                    <span>ProHired AI Platform</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Welcome to ProHired, {profile?.full_name?.split(" ")[0] || "Candidate"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {resumes.length > 0
                      ? `You have ${resumes.length} resume(s) analyzed. Highest ATS score is ${bestScore}/100. Explore matching openings or practice with the AI interview simulator.`
                      : "Upload your resume to calculate your real ATS score, detect missing keywords, and match live job openings."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      onClick={() => navigate("/app/resume/upload")}
                      className="bg-orange-500 hover:bg-orange-500 text-white shadow-glow-primary text-xs sm:text-sm font-semibold h-10 px-4 rounded-xl gap-2"
                    >
                      <Upload className="h-4 w-4" /> {resumes.length > 0 ? "Upload Another Resume" : "Upload Your Resume"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/app/jobs")}
                      className="border-gray-300 bg-gray-50/80 hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-semibold h-10 px-4 rounded-xl gap-2"
                    >
                      <Briefcase className="h-4 w-4 text-orange-500" /> Search Job Openings
                    </Button>
                  </div>
                </div>

                {/* Score & Resumes Widget */}
                <div className="w-full md:w-auto grid grid-cols-1 xs:grid-cols-2 md:flex md:flex-col gap-3 shrink-0">
                  <div className="flex-1 md:w-48 rounded-2xl bg-white/90 border border-gray-200 p-3.5 shadow-lg flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-base">
                      {bestScore > 0 ? bestScore : "—"}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Best ATS Score</p>
                      <p className="text-xs font-bold text-emerald-700">
                        {bestScore > 0 ? `${bestScore}/100 Score` : "Upload to calculate"}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 md:w-48 rounded-2xl bg-white/90 border border-gray-200 p-3.5 shadow-lg flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Resumes Stored</p>
                      <p className="text-xs font-bold text-orange-700">
                        {resumes.length} Documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Sub-App Action Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-orange-600" /> ProHired Application Suite
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Tool 1 */}
                <div
                  onClick={() => navigate("/app/resume/upload")}
                  className="glass-card p-4 flex flex-col justify-between cursor-pointer group hover:border-orange-500/40"
                >
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-400/40 text-orange-600 group-hover:scale-105 transition-transform">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                      ATS Resume Diagnostic
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      Upload your real PDF or DOCX file to test against 25+ enterprise ATS parsing rules.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
                    Open Scanner <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </div>
                </div>

                {/* Tool 2 */}
                <div
                  onClick={() => navigate("/app/jobs")}
                  className="glass-card p-4 flex flex-col justify-between cursor-pointer group hover:border-orange-500/40"
                >
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 border border-orange-300/50 text-orange-500 group-hover:scale-105 transition-transform">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-400 transition-colors">
                      Live Job Search
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      Search live openings by keyword, role, and location with one-click application tracking.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
                    Browse Jobs <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </div>
                </div>

                {/* Tool 3 */}
                <div
                  onClick={() => navigate("/app/interview")}
                  className="glass-card p-4 flex flex-col justify-between cursor-pointer group hover:border-orange-500/40"
                >
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 border border-orange-300/50 text-orange-500 group-hover:scale-105 transition-transform">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-400 transition-colors">
                      AI Mock Simulator
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      Generate questions for any role and receive real-time STAR scoring on your responses.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
                    Practice Now <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </div>
                </div>

                {/* Tool 4 */}
                <div
                  onClick={() => navigate("/app/profile")}
                  className="glass-card p-4 flex flex-col justify-between cursor-pointer group hover:border-amber-300"
                >
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-300 text-amber-700 group-hover:scale-105 transition-transform">
                      <Crown className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                      Pro Membership
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      Manage your subscription plan, recruiter contact details, and account preferences.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
                    Manage Plan <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature Showcase */}
        {activeTab === "features" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">ProHired Core Capabilities</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                End-to-end tools to diagnose, optimize, and match your resume to your target roles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/15 border border-orange-400/40 flex items-center justify-center text-orange-600">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Deterministic ATS Scoring</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Evaluates your resume against four critical pillars: content relevance, technical keywords, layout formatting, and quantifiable achievement metrics.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/app/resume/upload")}
                    className="bg-orange-500 text-white text-xs rounded-xl"
                  >
                    Upload Resume
                  </Button>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-300/50 flex items-center justify-center text-orange-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Live Job Search & Match</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Connects to live job openings and allows you to tailor your resume for specific positions with one click.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/app/jobs")}
                    className="bg-orange-400 text-white text-xs rounded-xl"
                  >
                    Search Jobs
                  </Button>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-300/50 flex items-center justify-center text-orange-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">STAR Mock Interview AI</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Enter your target role to generate tailored behavioral and technical questions, and receive AI feedback on your response structure.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/app/interview")}
                    className="bg-orange-600 text-white text-xs rounded-xl"
                  >
                    Practice Interview
                  </Button>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Interactive Resume Builder</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Refine your experience, skills, and summary with live ATS suggestions and export to clean, professional formats.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/app/resume/upload")}
                    className="bg-amber-600 text-white text-xs rounded-xl"
                  >
                    Launch Builder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Workflow */}
        {activeTab === "workflow" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">How ProHired Works</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                A simple 4-step workflow to prepare for your next job application.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Upload Your Real Resume",
                  desc: "Upload your existing PDF, DOCX, or text resume file directly to ProHired.",
                  btn: "Upload Now",
                  action: () => navigate("/app/resume/upload"),
                },
                {
                  step: "02",
                  title: "Review ATS Breakdown",
                  desc: "Inspect your overall score, content impact, formatting flaws, and missing keywords.",
                  btn: "View Scanner",
                  action: () => navigate("/app/resume/upload"),
                },
                {
                  step: "03",
                  title: "Search & Tailor for Jobs",
                  desc: "Search real job openings and tailor your resume to the exact job description.",
                  btn: "Find Jobs",
                  action: () => navigate("/app/jobs"),
                },
                {
                  step: "04",
                  title: "Practice Mock Interview",
                  desc: "Generate role-specific questions and practice your answers using the STAR method.",
                  btn: "Start Practice",
                  action: () => navigate("/app/interview"),
                },
              ].map((s) => (
                <div key={s.step} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl sm:text-3xl font-black text-orange-500/50 shrink-0 font-mono">
                      {s.step}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">{s.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={s.action}
                    className="border-gray-300 bg-gray-50/80 hover:bg-gray-100 text-xs shrink-0 text-gray-800"
                  >
                    {s.btn}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Pricing */}
        {activeTab === "pricing" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                ProHired Membership Plans
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Choose the plan that fits your career search needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Free Plan */}
              <div className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                !isPro ? "bg-white/80 border-orange-500/50 ring-2 ring-orange-500/20" : "bg-gray-50/60 border-gray-200"
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Starter Free</h3>
                      <p className="text-xs text-gray-500">Essential tools for job seekers</p>
                    </div>
                    {!isPro && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-500 border border-orange-400/40">
                        Current Active
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-foreground">
                    ₹0 <span className="text-xs text-gray-500 font-normal">/ forever</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ATS Resume Scoring & Keyword Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Live Job Search & Bookmarking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      AI Mock Interview Practice
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Button
                    variant="outline"
                    disabled
                    className="w-full rounded-xl border-gray-300 text-xs font-semibold cursor-default"
                  >
                    {!isPro ? "Current Active Plan" : "Basic Starter Tier"}
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                isPro
                  ? "bg-gradient-to-b from-amber-100/40 via-white/90 to-gray-50 border-amber-300 shadow-glow-amber ring-2 ring-amber-400/40"
                  : "bg-gray-50/80 border-amber-300 hover:border-amber-300"
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                        ProHired Pro <Crown className="h-4 w-4 text-amber-700" />
                      </h3>
                      <p className="text-xs text-gray-500">Unlimited access & priority features</p>
                    </div>
                    {isPro && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                        Current Active
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-foreground">
                    ₹49 <span className="text-xs text-gray-500 font-normal">/ month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0" />
                      Unlimited ATS Resume Scans & PDF Downloads
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0" />
                      Unlimited AI Mock Interview Sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0" />
                      Priority Job Matching & Application Support
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => { if (!isPro) setUpgradeOpen(true); }}
                    className={`w-full rounded-xl text-xs font-bold ${
                      isPro
                        ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100 cursor-default"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 shadow-glow-amber"
                    }`}
                  >
                    {isPro ? "✓ Pro Membership Active" : "Upgrade to Pro (₹49/mo)"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: FAQ */}
        {activeTab === "faq" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Common questions about ProHired.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How does ProHired score my resume?",
                  a: "ProHired evaluates your resume against industry applicant tracking systems, checking keyword frequency, header hierarchy, quantifiable impact, and formatting readability.",
                },
                {
                  q: "Is my personal data protected?",
                  a: "Yes. Documents uploaded to ProHired are processed securely in your private session and are never sold to external parties.",
                },
                {
                  q: "How do I practice for an interview?",
                  a: "Navigate to the Interview tab, enter your target role, generate a question, and submit your response to receive structured STAR feedback.",
                },
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-4 sm:p-5 space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-600 shrink-0" /> {item.q}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="full pro features" />
    </div>
  );
}
