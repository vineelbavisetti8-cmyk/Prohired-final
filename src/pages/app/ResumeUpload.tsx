import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  FileCheck,
  Trash2,
  Wand2,
  Brain,
  Building2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile } from "@/lib/resumeParser";
import { analyzeResumeWithGroq } from "@/lib/groqResumeAnalyzer";
import { generateSmartResumeAnalysis } from "@/lib/smartResumeAnalyzer";
import { toast } from "sonner";
import { ProUpgradeDialog } from "@/components/ProGate";
import AppSubNav, { SubNavTab } from "@/components/app/AppSubNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { isValidUuid } from "@/lib/utils";

const STEPS = [
  "📄 Reading your resume file...",
  "🧠 Extracting skills, achievements & contact info...",
  "🤖 Running deep AI analysis with ProHired engine...",
  "📊 Computing ATS score & role match recommendations...",
  "✅ Finalizing your ProHired ATS report!",
];

export const LOCAL_RESUMES_KEY = "prohired_local_resumes";
// Backward-compat: also check old hirerapid key
export const LEGACY_RESUMES_KEY = "hirerapid_local_resumes";

const SUB_TABS: SubNavTab[] = [
  { id: "upload", label: "ATS Scanner & Upload", icon: Upload },
  { id: "history", label: "My Saved Resumes", icon: FileText },
  { id: "builder_jump", label: "AI Resume Builder", icon: Wand2, badge: "Editor" },
];

export default function ResumeUpload() {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);
  const [resumes, setResumes] = useState<any[]>([]);

  // Role/Company modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");

  const isPro = profile?.plan === "pro";

  // Load saved resumes — check both prohired and old hirerapid keys
  const loadResumes = async () => {
    let list: any[] = [];
    try {
      const newList = JSON.parse(localStorage.getItem(LOCAL_RESUMES_KEY) || "[]");
      const oldList = JSON.parse(localStorage.getItem(LEGACY_RESUMES_KEY) || "[]");
      const combined = [...newList];
      const ids = new Set(newList.map((r: any) => r.id));
      for (const item of oldList) {
        if (!ids.has(item.id)) combined.push(item);
      }
      if (user) {
        list = combined.filter((r: any) => r.user_id === user.id || !r.user_id);
      } else {
        list = combined;
      }
    } catch {
      // ignore
    }

    if (user?.id && isValidUuid(user.id)) {
      try {
        const { data } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data && data.length) {
          const ids = new Set(list.map((r) => r.id));
          for (const item of data) {
            if (!ids.has(item.id)) list.push(item);
          }
        }
      } catch {
        // ignore
      }
    }
    setResumes(list);
  };

  useEffect(() => {
    loadResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Triggered when user clicks "Run ATS Analysis" — show role/company modal first
  const handlePrepareUpload = () => {
    if (!file) return;
    setShowRoleModal(true);
  };

  const handleStartUpload = async () => {
    if (!file) return;
    setShowRoleModal(false);
    setError(null);
    setBusy(true);
    setStepIdx(0);

    try {
      // Step 1: Extract real text from file
      let text = "";
      try {
        text = await extractTextFromFile(file);
      } catch (err) {
        console.warn("Text extraction notice:", err);
      }

      if (!text || text.trim().length < 20) {
        throw new Error(
          "Could not extract readable text from this file. Please upload a standard text PDF, DOCX, or TXT file."
        );
      }

      setStepIdx(1);
      await new Promise((r) => setTimeout(r, 400));

      const now = new Date().toISOString();
      const resumeId = `resume_${Date.now()}`;

      setStepIdx(2);

      // Deep AI analysis via Groq (with fallback to local analyzer)
      let analysisResult: any;
      const role = targetRole.trim() || "Software Engineer";
      const company = targetCompany.trim() || undefined;

      try {
        analysisResult = await analyzeResumeWithGroq(text, role, company);
      } catch (groqErr) {
        console.warn("Groq analysis failed, falling back to local analyzer:", groqErr);
        const smart = generateSmartResumeAnalysis(text, file.name);
        analysisResult = {
          atsScore: smart.atsScore,
          breakdown: smart.breakdown,
          weaknesses: smart.weaknesses,
          strengths: smart.strengths,
          missingKeywords: smart.missingKeywords,
          jobMatches: smart.jobMatches,
          rewrittenResume: smart.rewrittenResume,
        };
      }

      setStepIdx(3);
      await new Promise((r) => setTimeout(r, 400));

      const resumeRecord = {
        id: resumeId,
        user_id: user?.id || "user_local",
        file_name: file.name,
        original_text: text,
        rewritten_resume: analysisResult.rewrittenResume,
        ats_score: analysisResult.atsScore,
        score_breakdown: analysisResult.breakdown,
        weaknesses: analysisResult.weaknesses,
        missing_keywords: analysisResult.missingKeywords,
        strengths: analysisResult.strengths,
        job_matches: analysisResult.jobMatches,
        target_role: role,
        target_company: company || null,
        status: "complete",
        created_at: now,
        updated_at: now,
      };

      // Store in LocalStorage (prohired key)
      try {
        const existingLocal = JSON.parse(localStorage.getItem(LOCAL_RESUMES_KEY) || "[]");
        localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify([resumeRecord, ...existingLocal]));
      } catch (err) {
        console.warn("LocalStorage save error:", err);
      }

      // Also store target role for interview & job feed personalization
      try {
        localStorage.setItem("prohired_target_role", role);
        if (company) localStorage.setItem("prohired_target_company", company);
      } catch { }

      // Sync with Supabase if authenticated with a real Supabase UUID
      if (user?.id && isValidUuid(user.id)) {
        try {
          const supabasePayload = {
            file_name: file.name,
            original_text: text,
            rewritten_resume: analysisResult.rewrittenResume,
            ats_score: analysisResult.atsScore,
            score_breakdown: analysisResult.breakdown,
            weaknesses: analysisResult.weaknesses,
            missing_keywords: analysisResult.missingKeywords,
            strengths: analysisResult.strengths,
            job_matches: analysisResult.jobMatches,
            user_id: user.id,
            status: "complete",
            created_at: now,
            updated_at: now,
          };
          await supabase.from("resumes").upsert(supabasePayload as any);
        } catch {
          // ignore network/db errors
        }
      }

      setStepIdx(4);
      toast.success("Analysis complete! Opening your ProHired ATS report...");
      setTimeout(() => nav(`/app/resume/${resumeId}/analysis`), 600);
    } catch (e: any) {
      const msg =
        typeof e === "string" ? e : e?.message || "An unexpected error occurred during parsing.";
      setError(msg);
      toast.error(msg);
      setBusy(false);
      setStepIdx(-1);
    }
  };

  const handleDeleteResume = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const existingLocal = JSON.parse(localStorage.getItem(LOCAL_RESUMES_KEY) || "[]");
      const filtered = existingLocal.filter((r: any) => r.id !== id);
      localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(filtered));
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted from history");
    } catch {
      // ignore
    }
  };

  const handleSubTabChange = (id: string) => {
    if (id === "builder_jump") {
      const latestId = resumes[0]?.id || "new";
      nav(`/app/resume/${latestId}/builder`);
      return;
    }
    setActiveSubTab(id);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-App Navigation Tabs */}
      <AppSubNav
        tabs={SUB_TABS}
        activeTab={activeSubTab}
        onChange={handleSubTabChange}
      />

      {/* Role & Company Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Brain className="h-5 w-5 text-orange-500" />
              Personalize Your Analysis
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tell us your target role and company so our AI can tailor your ATS report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-500">
              Tell us your target role and company so our AI can tailor the ATS score, missing keywords,
              and job matches specifically for your goal.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="modal-role" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-orange-500" />
                Target Role <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="modal-role"
                placeholder="e.g. Software Engineer, Marketing Manager, Data Scientist"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-xl border-gray-200 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && targetRole.trim() && handleStartUpload()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-company" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-orange-500" />
                Target Company <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="modal-company"
                placeholder="e.g. Google, Flipkart, Microsoft, Amazon"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="rounded-xl border-gray-200 text-sm"
                onKeyDown={(e) => e.key === "Enter" && targetRole.trim() && handleStartUpload()}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                className="flex-1 rounded-xl text-sm"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!targetRole.trim()}
                onClick={handleStartUpload}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-glow-primary"
              >
                <Brain className="h-4 w-4 mr-1.5" />
                Run AI Analysis
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* TAB 1: SCANNER & UPLOAD */}
        {activeSubTab === "upload" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-orange-600" />
                ATS Resume Scanner & Diagnostics
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Powered by Groq AI — deep analysis tailored to your target role & company
              </p>
            </div>

            {/* Upload Area or Scanning Progress */}
            {busy ? (
              <div className="glass-card p-8 text-center space-y-5">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-600 animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {stepIdx === 2
                      ? "🤖 AI is deeply analyzing your resume..."
                      : "Parsing & Scoring Your Resume..."}
                  </h3>
                  <p className="text-xs text-orange-500 mt-1 font-medium">
                    {STEPS[stepIdx] || "Processing..."}
                  </p>
                  {stepIdx === 2 && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Groq AI · {targetRole}{targetCompany ? ` at ${targetCompany}` : ""}
                    </p>
                  )}
                </div>

                {/* Step Progress Bar */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-orange-300 to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(15, ((stepIdx + 1) / STEPS.length) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Reading File</span>
                    <span>AI Analysis</span>
                    <span>Final Report</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Drag & Drop Zone */}
                <div className="lg:col-span-7 space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className={`glass-card p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed transition-all cursor-pointer ${file
                        ? "border-orange-500/60 bg-orange-50"
                        : "border-gray-200 hover:border-orange-500/40 hover:bg-gray-50/70"
                      }`}
                    onClick={() => document.getElementById("resume-input-file")?.click()}
                  >
                    <input
                      id="resume-input-file"
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={onPick}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-600">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB · Ready to analyze
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrepareUpload();
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold px-5 shadow-glow-primary"
                          >
                            <Brain className="h-3.5 w-3.5 mr-1.5" />
                            Run AI Analysis
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                            className="text-gray-500 hover:text-gray-800 text-xs"
                          >
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-400/40 text-orange-600">
                          <Upload className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-gray-800">
                            Click to upload or drag & drop your resume
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: PDF, DOCX, DOC, TXT (up to 10MB)
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2">
                          🔒 Evaluated securely in your private session
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                      {error}
                    </div>
                  )}
                </div>

                {/* Right Column: Desktop Info & Checklist */}
                <div className="lg:col-span-5 space-y-3.5">
                  <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-600" /> ProHired AI Engine
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-200">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          🤖
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Prohired AI Deep Analysis</p>
                          <p className="text-[11px] text-gray-500">Top-tier 120B model scores your resume against real ATS rules.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-200">
                        <div className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                          🎯
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Role-Specific Scoring</p>
                          <p className="text-[11px] text-gray-500">Tell us your role & company for a custom analysis.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-200">
                        <div className="h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                          ✍️
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">AI Resume Rewrite</p>
                          <p className="text-[11px] text-gray-500">Get a fully rewritten ATS-optimized version of your resume.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY SAVED RESUMES */}
        {activeSubTab === "history" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Your Uploaded Resumes</h3>
                <p className="text-xs text-gray-500">Manage all resumes you have analyzed with ProHired.</p>
              </div>
              <Button
                onClick={() => setActiveSubTab("upload")}
                size="sm"
                className="bg-orange-500 text-white rounded-xl text-xs font-semibold"
              >
                + Upload New
              </Button>
            </div>

            {resumes.length > 0 ? (
              <div className="space-y-3">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => nav(`/app/resume/${r.id}/analysis`)}
                    className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-orange-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-orange-500/15 border border-orange-400/40 text-orange-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-500 truncate">
                          {r.file_name || "Resume Document"}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {r.target_role && (
                            <span className="text-orange-600 font-semibold">{r.target_role} · </span>
                          )}
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-emerald-700 flex items-center gap-1 justify-end">
                          {r.ats_score || 0} <span className="text-[10px] text-gray-500 font-normal">/ 100</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">ATS Score</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteResume(r.id, e)}
                        className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-10 text-center space-y-3">
                <FileText className="h-10 w-10 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600 font-medium">No resumes uploaded yet</p>
                <p className="text-xs text-gray-400">
                  Upload your resume in the scanner tab to see your detailed ATS report.
                </p>
                <Button
                  onClick={() => setActiveSubTab("upload")}
                  className="bg-orange-500 text-white text-xs rounded-xl mt-2"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Your Resume
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ProUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
