import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, FileDown, FileText, Loader2, Save, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ResumeRecord } from "@/types";
import { toast } from "sonner";
import { downloadAsPDF, downloadAsDOCX } from "@/lib/resumeExport";
import { generateSmartResumeAnalysis } from "@/lib/smartResumeAnalyzer";
import { useAuth } from "@/contexts/AuthContext";
import { ProUpgradeDialog } from "@/components/ProGate";
import { isValidUuid } from "@/lib/utils";

interface ResumeData {
  personal: { name: string; email: string; phone: string; linkedin: string; location: string };
  summary: string;
  experience: Array<{ title: string; company: string; dates: string; bullets: string }>;
  skills: string[];
  education: Array<{ degree: string; institution: string; year: string; gpa: string }>;
  projects: Array<{ title: string; description: string; link: string }>;
}

const EMPTY: ResumeData = {
  personal: { name: "", email: "", phone: "", linkedin: "", location: "" },
  summary: "",
  experience: [{ title: "", company: "", dates: "", bullets: "" }],
  skills: [],
  education: [{ degree: "", institution: "", year: "", gpa: "" }],
  projects: [{ title: "", description: "", link: "" }],
};

export default function ResumeBuilder() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const isPro = profile?.plan === "pro";
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [data, setData] = useState<ResumeData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [improvingSection, setImprovingSection] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "edit">("edit");
  const [open, setOpen] = useState<Record<string, boolean>>({ personal: true, summary: true, experience: true, skills: false, education: false, projects: false });

  useEffect(() => {
    if (!id) return;
    (async () => {
      let rec: any = null;

      // Check local storage first
      try {
        const localList = JSON.parse(
          localStorage.getItem("prohired_local_resumes") ||
          localStorage.getItem("hirerapid_local_resumes") ||
          "[]"
        );
        rec = localList.find((r: any) => r.id === id);
        if (!rec && id.startsWith("resume_") && localList.length > 0) {
          rec = localList[0];
        }
      } catch {
        // ignore
      }

      // If not found locally and id is valid UUID, check Supabase
      if (!rec && isValidUuid(id)) {
        try {
          const { data: r } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
          rec = r;
        } catch {
          // ignore
        }
      }

      setResume(rec as unknown as ResumeRecord | null);
      if (rec?.rewritten_resume) setData(parseMarkdown(rec.rewritten_resume));
      setLoading(false);
    })();
  }, [id]);

  const markdown = buildMarkdown(data);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);

    const now = new Date().toISOString();

    // Re-analyze updated ATS resume text to extract refreshed skills, job matches, and ATS score
    let updatedScore = resume?.ats_score ?? 80;
    let updatedBreakdown = resume?.score_breakdown;
    let updatedWeaknesses = resume?.weaknesses ?? [];
    let updatedMissingKeywords = resume?.missing_keywords ?? [];
    let updatedStrengths = resume?.strengths ?? [];
    let updatedJobMatches = resume?.job_matches ?? [];

    try {
      const smart = generateSmartResumeAnalysis(markdown, resume?.file_name ?? "resume");
      updatedScore = smart.atsScore;
      updatedBreakdown = smart.breakdown;
      updatedWeaknesses = smart.weaknesses;
      updatedMissingKeywords = smart.missingKeywords;
      updatedStrengths = smart.strengths;
      updatedJobMatches = smart.jobMatches;
    } catch (err) {
      console.warn("Re-analysis warning on save:", err);
    }

    const updatedFields = {
      rewritten_resume: markdown,
      ats_score: updatedScore,
      score_breakdown: updatedBreakdown,
      weaknesses: updatedWeaknesses,
      missing_keywords: updatedMissingKeywords,
      strengths: updatedStrengths,
      job_matches: updatedJobMatches,
      updated_at: now,
    };

    try {
      const localList = JSON.parse(
        localStorage.getItem("prohired_local_resumes") ||
        localStorage.getItem("hirerapid_local_resumes") ||
        localStorage.getItem("prohired_local_resumes") ||
        "[]"
      );
      const idx = localList.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        localList[idx] = { ...localList[idx], ...updatedFields };
        localStorage.setItem("prohired_local_resumes", JSON.stringify(localList));
      }
    } catch {
      // ignore
    }

    if (id && isValidUuid(id)) {
      try {
        await supabase.from("resumes").update(updatedFields as any).eq("id", id);
      } catch {
        // ignore
      }
    }

    // Invalidate user's daily job feed cache so it re-runs job matching with updated ATS resume
    if (resume?.user_id) {
      localStorage.removeItem(`prohired_daily_feed_${resume.user_id}`);
    }

    setResume((prev) => (prev ? { ...prev, ...updatedFields } as ResumeRecord : null));
    setSaving(false);
    toast.success("ATS resume saved & updated!");
  };

  const baseName = (resume?.file_name ?? "resume").replace(/\.[^.]+$/, "");
  const handleDownloadPDF = () => {
    if (!markdown.trim()) return toast.error("Nothing to export yet");
    downloadAsPDF(markdown, baseName);
  };
  const handleDownloadDOCX = async () => {
    if (!isPro) { setUpgradeOpen(true); return; }
    if (!markdown.trim()) return toast.error("Nothing to export yet");
    try { await downloadAsDOCX(markdown, baseName); toast.success("DOCX downloaded"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "DOCX export failed"); }
  };

  const aiImprove = async (section: keyof ResumeData) => {
    setImprovingSection(section as string);
    try {
      const sectionText = sectionToText(data, section);
      if (!sectionText.trim()) {
        toast.error("Nothing to improve in this section yet");
        return;
      }
      const { data: res, error } = await supabase.functions.invoke("improve-section", {
        body: { section: String(section), content: sectionText },
      });
      if (error) throw error;
      const improved = res?.improved as string | undefined;
      if (!improved) throw new Error("No suggestion returned");
      setData((d) => applyImprovedSection(d, section, improved));
      toast.success("Section improved by AI");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI improve failed");
    } finally {
      setImprovingSection(null);
    }
  };

  if (loading) return (
    <div className="container max-w-6xl px-4 py-10 space-y-4">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
  if (!resume) return (
    <div className="container max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">Resume not found</h1>
      <Button asChild variant="hero" className="mt-6"><Link to="/app/dashboard">Back to dashboard</Link></Button>
    </div>
  );

  return (
    <div className="container max-w-7xl px-4 py-6 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/app/resume/${id}/analysis`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3 w-3" /> Back to analysis</Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Resume builder</h1>
          <p className="text-xs text-muted-foreground truncate">{resume.file_name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {resume.ats_score != null && <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">ATS {resume.ats_score}/100</span>}
          <Button variant="soft" size="sm" className="h-10 flex-1 sm:flex-initial" onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button variant="soft" size="sm" className="h-10 flex-1 sm:flex-initial" onClick={handleDownloadDOCX}>
            <FileText className="h-4 w-4" /> DOCX{!isPro && " 🔒"}
          </Button>
          <Button variant="hero" size="sm" className="h-10 flex-1 sm:flex-initial" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>
      <ProUpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} feature="DOCX export" />

      {/* Mobile tab toggle */}
      <div className="mt-5 inline-flex w-full rounded-xl border border-border bg-surface p-1 lg:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {/* Preview */}
        <div className={`${tab === "preview" ? "block" : "hidden"} lg:block`}>
          <div className="glass-card p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Live preview</div>
            <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90">
              <ReactMarkdown>{markdown || "_Start editing to see your resume here…_"}</ReactMarkdown>
            </article>
          </div>
        </div>

        {/* Editor */}
        <div className={`${tab === "edit" ? "block" : "hidden"} lg:block space-y-3`}>
          <Section title="Personal info" open={open.personal} onToggle={() => setOpen({ ...open, personal: !open.personal })}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value={data.personal.name} onChange={(v) => setData({ ...data, personal: { ...data.personal, name: v } })} />
              <Field label="Email" value={data.personal.email} onChange={(v) => setData({ ...data, personal: { ...data.personal, email: v } })} />
              <Field label="Phone" value={data.personal.phone} onChange={(v) => setData({ ...data, personal: { ...data.personal, phone: v } })} />
              <Field label="LinkedIn" value={data.personal.linkedin} onChange={(v) => setData({ ...data, personal: { ...data.personal, linkedin: v } })} />
              <Field label="Location" value={data.personal.location} onChange={(v) => setData({ ...data, personal: { ...data.personal, location: v } })} className="sm:col-span-2" />
            </div>
          </Section>

          <Section title="Summary" open={open.summary} onToggle={() => setOpen({ ...open, summary: !open.summary })} aiAction={() => aiImprove("summary")} aiBusy={improvingSection === "summary"}>
            <Textarea value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} className="min-h-[120px] bg-surface-2 border-border text-sm" placeholder="3-4 powerful sentences about who you are." />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">{data.summary.length} chars</div>
          </Section>

          <Section title="Experience" open={open.experience} onToggle={() => setOpen({ ...open, experience: !open.experience })} aiAction={() => aiImprove("experience")} aiBusy={improvingSection === "experience"}>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface-2 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field label="Title" value={exp.title} onChange={(v) => updateArr(setData, "experience", i, { title: v })} />
                    <Field label="Company" value={exp.company} onChange={(v) => updateArr(setData, "experience", i, { company: v })} />
                    <Field label="Dates" value={exp.dates} onChange={(v) => updateArr(setData, "experience", i, { dates: v })} className="sm:col-span-2" placeholder="Jan 2022 — Present" />
                  </div>
                  <Textarea value={exp.bullets} onChange={(e) => updateArr(setData, "experience", i, { bullets: e.target.value })} className="mt-2 min-h-[100px] bg-surface border-border text-sm" placeholder="- Led ...&#10;- Built ...&#10;- Increased ..." />
                  {data.experience.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setData({ ...data, experience: data.experience.filter((_, x) => x !== i) })} className="mt-2 text-destructive hover:text-destructive">Remove</Button>
                  )}
                </div>
              ))}
              <Button variant="soft" size="sm" onClick={() => setData({ ...data, experience: [...data.experience, { title: "", company: "", dates: "", bullets: "" }] })}>+ Add experience</Button>
            </div>
          </Section>

          <Section title="Skills" open={open.skills} onToggle={() => setOpen({ ...open, skills: !open.skills })} aiAction={() => aiImprove("skills")} aiBusy={improvingSection === "skills"}>
            <SkillEditor skills={data.skills} onChange={(s) => setData({ ...data, skills: s })} />
          </Section>

          <Section title="Education" open={open.education} onToggle={() => setOpen({ ...open, education: !open.education })}>
            <div className="space-y-3">
              {data.education.map((ed, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-border bg-surface-2 p-3 sm:grid-cols-2">
                  <Field label="Degree" value={ed.degree} onChange={(v) => updateArr(setData, "education", i, { degree: v })} />
                  <Field label="Institution" value={ed.institution} onChange={(v) => updateArr(setData, "education", i, { institution: v })} />
                  <Field label="Year" value={ed.year} onChange={(v) => updateArr(setData, "education", i, { year: v })} />
                  <Field label="GPA" value={ed.gpa} onChange={(v) => updateArr(setData, "education", i, { gpa: v })} />
                  {data.education.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setData({ ...data, education: data.education.filter((_, x) => x !== i) })} className="text-destructive hover:text-destructive sm:col-span-2 justify-self-start">Remove</Button>
                  )}
                </div>
              ))}
              <Button variant="soft" size="sm" onClick={() => setData({ ...data, education: [...data.education, { degree: "", institution: "", year: "", gpa: "" }] })}>+ Add education</Button>
            </div>
          </Section>

          <Section title="Projects" open={open.projects} onToggle={() => setOpen({ ...open, projects: !open.projects })} aiAction={() => aiImprove("projects")} aiBusy={improvingSection === "projects"}>
            <div className="space-y-3">
              {data.projects.map((p, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface-2 p-3 space-y-2">
                  <Field label="Title" value={p.title} onChange={(v) => updateArr(setData, "projects", i, { title: v })} />
                  <Textarea value={p.description} onChange={(e) => updateArr(setData, "projects", i, { description: e.target.value })} className="min-h-[80px] bg-surface border-border text-sm" placeholder="What it does, what you built, impact." />
                  <Field label="Link" value={p.link} onChange={(v) => updateArr(setData, "projects", i, { link: v })} placeholder="https://" />
                  {data.projects.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setData({ ...data, projects: data.projects.filter((_, x) => x !== i) })} className="text-destructive hover:text-destructive">Remove</Button>
                  )}
                </div>
              ))}
              <Button variant="soft" size="sm" onClick={() => setData({ ...data, projects: [...data.projects, { title: "", description: "", link: "" }] })}>+ Add project</Button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, open, onToggle, children, aiAction, aiBusy }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode; aiAction?: () => void; aiBusy?: boolean }) {
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left">
        <span className="font-display text-base font-bold">{title}</span>
        <div className="flex items-center gap-2">
          {aiAction && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); if (!aiBusy) aiAction(); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); if (!aiBusy) aiAction(); } }}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 cursor-pointer"
            >
              {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              AI improve
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && <div className="border-t border-border px-5 py-4">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, className, placeholder }: { label: string; value: string; onChange: (v: string) => void; className?: string; placeholder?: string }) {
  return (
    <div className={className}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 bg-surface-2 border-border text-sm" />
    </div>
  );
}

function SkillEditor({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (!skills.includes(v)) onChange([...skills, v]);
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {s}
            <button onClick={() => onChange(skills.filter((x) => x !== s))} className="ml-1 text-primary/70 hover:text-primary" aria-label={`Remove ${s}`}>×</button>
          </span>
        ))}
        {skills.length === 0 && <span className="text-xs text-muted-foreground">No skills yet — add some below.</span>}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Type a skill and press Enter" className="h-10 bg-surface-2 border-border text-sm" />
        <Button variant="soft" size="sm" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

// helpers
function updateArr<K extends "experience" | "education" | "projects">(setData: React.Dispatch<React.SetStateAction<ResumeData>>, key: K, i: number, patch: Partial<ResumeData[K][number]>) {
  setData((d) => ({ ...d, [key]: d[key].map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));
}

function buildMarkdown(d: ResumeData): string {
  const lines: string[] = [];
  if (d.personal.name) lines.push(`# ${d.personal.name}`);
  const contact = [d.personal.email, d.personal.phone, d.personal.linkedin, d.personal.location].filter(Boolean).join(" · ");
  if (contact) lines.push(contact, "");

  if (d.summary) {
    lines.push("## Professional Summary", d.summary, "");
  }

  if (d.experience.some((e) => e.title || e.company)) {
    lines.push("## Experience");
    d.experience.forEach((e) => {
      if (!(e.title || e.company)) return;
      lines.push(`### ${e.title || "Role"}${e.dates ? ` — ${e.dates}` : ""}`);
      if (e.company) lines.push(`**${e.company}**`);
      if (e.bullets) lines.push(e.bullets);
      lines.push("");
    });
  }

  if (d.skills.length) {
    lines.push("## Technical Skills", d.skills.join(", "), "");
  }

  if (d.education.some((e) => e.degree || e.institution)) {
    lines.push("## Education");
    d.education.forEach((e) => {
      if (!(e.degree || e.institution)) return;
      lines.push(`### ${e.degree || "Degree"}${e.year ? ` — ${e.year}` : ""}`);
      if (e.institution) lines.push(`**${e.institution}**${e.gpa ? ` · GPA ${e.gpa}` : ""}`);
      lines.push("");
    });
  }

  if (d.projects.some((p) => p.title || p.description)) {
    lines.push("## Projects");
    d.projects.forEach((p) => {
      if (!(p.title || p.description)) return;
      lines.push(`### ${p.title || "Project"}${p.link ? ` — [link](${p.link})` : ""}`);
      if (p.description) lines.push(p.description);
      lines.push("");
    });
  }
  return lines.join("\n");
}

function parseMarkdown(md: string): ResumeData {
  const out: ResumeData = JSON.parse(JSON.stringify(EMPTY));
  const lines = md.split(/\r?\n/);
  let i = 0;
  
  // Parse name
  while (i < lines.length && !lines[i].startsWith("# ")) i++;
  if (i < lines.length) { out.personal.name = lines[i].replace(/^#\s*/, "").trim(); i++; }
  
  // Parse contact
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length && !lines[i].startsWith("#")) {
    const parts = lines[i].split(/[·•|]/).map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => {
      if (/@/.test(p)) out.personal.email = p;
      else if (/^\+?\d[\d\s-]{6,}$/.test(p)) out.personal.phone = p;
      else if (/linkedin/i.test(p)) out.personal.linkedin = p;
      else if (!out.personal.location) out.personal.location = p;
    });
    i++;
  }

  const sections: Record<string, string[]> = {};
  let current: string | null = null;
  for (; i < lines.length; i++) {
    const l = lines[i];
    const h = l.match(/^##\s+(.+)/);
    if (h) { current = h[1].toLowerCase(); sections[current] = []; continue; }
    if (current) sections[current].push(l);
  }

  if (sections.summary || sections["professional summary"]) {
    out.summary = (sections.summary || sections["professional summary"]).join("\n").trim();
  }
  
  if (sections.skills || sections["technical skills"]) {
    const txt = (sections.skills || sections["technical skills"]).join(" ").trim();
    out.skills = txt.split(/[,•·]/).map((s) => s.trim()).filter(Boolean);
  }

  if (sections.experience) {
    out.experience = parseBlocks(sections.experience).map((blk) => ({
      title: blk.header,
      company: blk.subtitle,
      dates: blk.meta,
      bullets: blk.body,
    }));
    if (!out.experience.length) out.experience = EMPTY.experience;
  }

  if (sections.education) {
    out.education = parseBlocks(sections.education).map((blk) => {
      const [inst, gpa] = blk.subtitle.split("·").map((s) => s.trim());
      return {
        degree: blk.header,
        institution: inst ?? "",
        year: blk.meta,
        gpa: gpa?.replace(/GPA\s*/i, "") ?? "",
      };
    });
    if (!out.education.length) out.education = EMPTY.education;
  }

  if (sections.projects) {
    out.projects = parseBlocks(sections.projects).map((blk) => {
      const m = blk.header.match(/^(.+?)(?:\s+—\s+\[link\]\((.+)\))?$/);
      return { title: m?.[1] ?? blk.header, description: blk.body, link: m?.[2] ?? "" };
    });
    if (!out.projects.length) out.projects = EMPTY.projects;
  }

  return out;
}

function parseBlocks(lines: string[]): Array<{ header: string; meta: string; subtitle: string; body: string }> {
  const blocks: Array<{ header: string; meta: string; subtitle: string; body: string }> = [];
  let cur: { header: string; meta: string; subtitle: string; body: string } | null = null;
  for (const raw of lines) {
    const l = raw.replace(/\s+$/, "");
    if (l.startsWith("### ")) {
      if (cur) blocks.push(cur);
      const content = l.slice(4).trim();
      // Supports both "Title — Meta" (builder's own format) and "Title | Meta" (AI/fallback format).
      const sep = content.includes(" — ") ? " — " : content.includes(" | ") ? " | " : null;
      const [header, meta] = sep ? content.split(sep).map((s) => s.trim()) : [content, ""];
      cur = { header: header ?? "", meta: meta ?? "", subtitle: "", body: "" };
    } else if (cur && l.startsWith("**")) {
      cur.subtitle = l.replace(/\*\*/g, "").trim();
    } else if (cur && /^_[^_]+_$/.test(l.trim())) {
      // A lone italic line right under the header (e.g. "_Jan 2022 - Present_") is the date meta.
      if (!cur.meta) cur.meta = l.trim().replace(/^_|_$/g, "");
    } else if (cur) {
      if (l.trim() || cur.body) cur.body += (cur.body ? "\n" : "") + l;
    }
  }
  if (cur) blocks.push(cur);
  return blocks;
}

function sectionToText(d: ResumeData, key: keyof ResumeData): string {
  switch (key) {
    case "summary": return d.summary;
    case "skills": return d.skills.join(", ");
    case "experience": return d.experience.map((e) => `${e.title} — ${e.company} (${e.dates})\n${e.bullets}`).join("\n\n");
    case "projects": return d.projects.map((p) => `${p.title}\n${p.description}`).join("\n\n");
    default: return "";
  }
}

function applyImprovedSection(d: ResumeData, key: keyof ResumeData, improved: string): ResumeData {
  const next = { ...d };
  switch (key) {
    case "summary":
      next.summary = improved.trim();
      break;
    case "skills":
      next.skills = improved.split(/[, \n•·]/).map((s) => s.trim()).filter(Boolean);
      break;
    case "experience": {
      // Replace bullets of the first experience entry; keep header info.
      const cleaned = improved.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("-") ? l : `- ${l}`).join("\n");
      next.experience = next.experience.map((e, i) => (i === 0 ? { ...e, bullets: cleaned } : e));
      break;
    }
    case "projects":
      next.projects = next.projects.map((p, i) => (i === 0 ? { ...p, description: improved.trim() } : p));
      break;
  }
  return next;
}
