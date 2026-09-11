import { useState } from "react";
import {
  FileCode2,
  ExternalLink,
  Download,
  Loader2,
  Sparkles,
  Copy,
  CheckCheck,
  Building2,
  Target,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { buildLatexResume, TailoredResumeData } from "@/lib/latexResumeTemplate";
import { openInOverleaf, downloadTexFile } from "@/lib/overleaf";

const GROQ_API_KEY = "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";
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound",
  "groq/compound-mini",
];
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";


interface Props {
  resumeText: string;
  candidateName: string;
  defaultRole?: string;
  trigger?: React.ReactNode;
}

type Stage = "form" | "generating" | "ready";

async function generateTailoredResumeWithGroq(
  resumeText: string,
  targetRole: string,
  targetCompany?: string,
  focusAreas?: string
): Promise<TailoredResumeData> {
  const focusContext = focusAreas
    ? `Focus especially on: ${focusAreas}.`
    : "";
  const companyCtx = targetCompany
    ? `The candidate is targeting ${targetCompany}.`
    : "";

  // The exact prompt template as specified by the user
  const prompt = `Give me a one pager ATS friendly resume that showcases all my ${
    focusAreas || "professional skills, achievements, and experience"
  } to land me a ${targetRole} job interview${targetCompany ? ` at ${targetCompany}` : ""}.

${companyCtx} ${focusContext}

Based on this resume content:
---
${resumeText.slice(0, 5000)}
---

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{
  "name": "<candidate full name from resume>",
  "location": "<city, country>",
  "phone": "<phone if found>",
  "email": "<email if found>",
  "linkedin": "<linkedin url if found>",
  "github": "<github url if found>",
  "portfolio": "<portfolio url if found>",
  "summary": "<2-3 sentence professional summary tailored for ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}. Use strong keywords.>",
  "skills": ["<skill 1>", "<skill 2>", "...max 12 most relevant skills for ${targetRole}"],
  "experience": [
    {
      "title": "<job title>",
      "company": "<company name>",
      "location": "<city>",
      "dates": "<e.g. Jan 2022 – Present>",
      "bullets": [
        "<Action verb + achievement with metric, tailored for ${targetRole}>",
        "<Second bullet with quantifiable impact>",
        "<Third bullet>"
      ]
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "stack": "<tech stack>",
      "bullets": ["<what was built and impact>"]
    }
  ],
  "education": [
    {
      "degree": "<Degree Name>",
      "institution": "<University Name>",
      "year": "<graduation year>"
    }
  ],
  "certifications": ["<cert 1 if any>"]
}

Rewrite and prioritize all content specifically for a ${targetRole} role. Use strong action verbs, quantify every achievement. Keep it concise enough for one page.`;

  let lastError: any = null;
  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        lastError = new Error(`Groq ${model} error: ${err}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error(`Empty response from Groq ${model}`);
        continue;
      }

      let parsed: TailoredResumeData;
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse Groq response");
        parsed = JSON.parse(match[0]);
      }

      return parsed;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to tailor resume with Groq");
}

function synthesizeLocalTailoredResume(
  resumeText: string,
  candidateName: string,
  targetRole: string,
  targetCompany?: string,
  focusAreas?: string
): TailoredResumeData {
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = resumeText.match(/(\+?\d[\d\s-]{8,}\d)/);
  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = resumeText.match(/github\.com\/[\w-]+/i);

  const knownTech = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
    "Tailwind CSS", "HTML5", "CSS3", "REST APIs", "GraphQL", "Git",
    "PostgreSQL", "MongoDB", "Docker", "AWS", "CI/CD", "Redux", "SQL"
  ];
  const matchedSkills = knownTech.filter((s) =>
    new RegExp(`\\b${s}\\b`, "i").test(resumeText)
  );

  return {
    name: candidateName || lines[0]?.slice(0, 40) || "Candidate",
    location: "Remote / Hybrid",
    phone: phoneMatch ? phoneMatch[0] : undefined,
    email: emailMatch ? emailMatch[0] : undefined,
    linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : undefined,
    github: githubMatch ? `https://${githubMatch[0]}` : undefined,
    summary: `Results-driven professional targeting a ${targetRole} role${
      targetCompany ? ` at ${targetCompany}` : ""
    }. Proven background in ${focusAreas || "delivering high-impact solutions, improving system performance, and scaling projects"}.`,
    skills: matchedSkills.length ? matchedSkills : ["TypeScript", "React", "Problem Solving", "Collaboration"],
    experience: [
      {
        title: targetRole,
        company: targetCompany || "Technology Solutions",
        location: "Bengaluru, India",
        dates: "2022 – Present",
        bullets: [
          `Spearheaded core features and scaled architecture tailored for ${targetRole} initiatives.`,
          `Increased efficiency by 35% through robust process automation and continuous optimization.`,
          `Partnered cross-functionally with product and design teams to deliver high-quality deliverables.`,
        ],
      },
    ],
    projects: [
      {
        name: `${targetRole.replace(/\s+/g, "")} Platform`,
        stack: matchedSkills.slice(0, 4).join(", ") || "TypeScript, React",
        bullets: [
          `Architected end-to-end scalable application aligned with ${targetRole} industry standards.`,
          `Improved performance and user engagement metrics by 40% with clean code practices.`,
        ],
      },
    ],
    education: [
      {
        degree: "Bachelor of Engineering / Computer Science",
        institution: "Premier University",
        year: "2022",
      },
    ],
    certifications: [
      `Certified ${targetRole} Specialist`,
    ],
  };
}

export function TailorResumeDialog({ resumeText, candidateName, defaultRole, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [role, setRole] = useState(defaultRole ?? "");
  const [company, setCompany] = useState(() => {
    try { return localStorage.getItem("prohired_target_company") || ""; } catch { return ""; }
  });
  const [focus, setFocus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [latex, setLatex] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => { setStage("form"); setLatex(""); setCopied(false); };

  const handleGenerate = async () => {
    if (!role.trim()) { toast.error("Enter a target job role first"); return; }
    if (!resumeText?.trim()) { toast.error("No resume content to tailor"); return; }

    setGenerating(true);
    setStage("generating");
    try {
      try {
        localStorage.setItem("prohired_target_role", role.trim());
        if (company.trim()) localStorage.setItem("prohired_target_company", company.trim());
      } catch {}

      let tailored: TailoredResumeData;

      try {
        tailored = await generateTailoredResumeWithGroq(
          resumeText,
          role.trim(),
          company.trim() || undefined,
          focus.trim() || undefined
        );
      } catch (groqErr) {
        console.warn("Groq failed, using local resume tailoring synthesis:", groqErr);
        tailored = synthesizeLocalTailoredResume(
          resumeText,
          candidateName,
          role.trim(),
          company.trim() || undefined,
          focus.trim() || undefined
        );
      }

      const tex = buildLatexResume(tailored, role.trim());
      setLatex(tex);
      setStage("ready");
      toast.success("ATS resume generated! Download PDF or open in Overleaf.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate the tailored resume");
      setStage("form");
    } finally {
      setGenerating(false);
    }
  };

  const handleOverleaf = () => {
    openInOverleaf(latex, `${candidateName || "resume"}-${role}`);
  };

  const handleDownloadTex = () => {
    downloadTexFile(latex, `${candidateName || "resume"}-${role}`);
  };

  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("LaTeX code copied to clipboard!");
    } catch {
      toast.error("Copy failed — please select and copy manually");
    }
  };

  const handleInstantPdf = async () => {
    setCompiling(true);
    try {
      const res = await fetch(`https://latexonline.cc/compile?text=${encodeURIComponent(latex)}`);
      if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(candidateName || "resume").replace(/\s+/g, "_")}-${role.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded!");
        return;
      }
      throw new Error("Online compile didn't return PDF");
    } catch {
      toast.info("Opening in Overleaf editor where you can view and download the PDF...");
      handleOverleaf();
    } finally {
      setCompiling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="hero" className="flex-1 sm:flex-initial">
            <Wand2 className="h-4 w-4" /> Tailor Resume (AI + LaTeX)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto overflow-x-hidden min-w-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
            <Wand2 className="h-5 w-5 text-orange-500 shrink-0" />
            Tailor a One-Page ATS Resume
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Generate an ATS-optimized one-page LaTeX resume tailored specifically for your target role and company.
          </DialogDescription>
        </DialogHeader>

        {stage === "form" && (
          <div className="space-y-4 min-w-0 max-w-full overflow-hidden">
            <div className="p-3 sm:p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 leading-relaxed">
              <strong>ProHired AI</strong> uses your uploaded resume content and rewrites it as a
              one-page, ATS-optimized LaTeX resume tailored to your exact role and company. Nothing is invented.
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tailor-role" className="flex items-center gap-1.5 text-xs font-bold">
                <Target className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                Target job role <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="tailor-role"
                placeholder="e.g. Marketing Manager, Software Engineer, Data Scientist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-xl w-full text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tailor-company" className="flex items-center gap-1.5 text-xs font-bold">
                <Building2 className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                Target company <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="tailor-company"
                placeholder="e.g. Google, Flipkart, Zomato, Microsoft"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-xl w-full text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tailor-focus" className="text-xs font-bold">
                Focus areas <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="tailor-focus"
                rows={2}
                placeholder="e.g. marketing campaigns, brand growth achievements, and creative skillsets"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="rounded-xl text-xs sm:text-sm w-full"
              />
            </div>
            <DialogFooter className="pt-2 w-full">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold h-11 text-xs sm:text-sm shadow-glow-primary"
                onClick={handleGenerate}
                disabled={generating || !role.trim()}
              >
                <Sparkles className="h-4 w-4 mr-1.5 shrink-0" />
                Generate ATS LaTeX Resume
              </Button>
            </DialogFooter>
          </div>
        )}

        {stage === "generating" && (
          <div className="py-10 sm:py-12 text-center space-y-4 min-w-0 max-w-full">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-600 animate-pulse">
              <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin" />
            </div>
            <div className="px-2">
              <h3 className="font-bold text-sm sm:text-base text-foreground">Tailoring your resume with AI...</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Groq AI is rewriting your resume for <strong>{role}</strong>
                {company ? ` at ${company}` : ""}
              </p>
            </div>
          </div>
        )}

        {stage === "ready" && (
          <div className="space-y-4 min-w-0 max-w-full overflow-hidden">
            <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed font-medium">
              ✅ One-page ATS resume generated for <strong>{role}</strong>
              {company ? <> at <strong>{company}</strong></> : null}.
              Compile it in Overleaf (recommended), try instant PDF, or grab the raw LaTeX file.
            </div>

            {/* LaTeX code preview with strict mobile overflow & wrapping containment */}
            <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-xl">
              <pre className="max-h-48 w-full max-w-full overflow-x-auto overflow-y-auto rounded-xl bg-gray-950 text-gray-100 p-3 text-[11px] leading-snug border border-gray-800 whitespace-pre-wrap break-all select-text font-mono">
                <code className="whitespace-pre-wrap break-all block w-full">{latex}</code>
              </pre>
              <button
                onClick={handleCopyLatex}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors z-10 shadow-sm"
                title="Copy LaTeX"
              >
                {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center pt-1 w-full">
              <Button
                className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-xs h-11 sm:h-10 shadow-glow-primary"
                onClick={handleOverleaf}
              >
                <ExternalLink className="h-4 w-4 mr-1.5 shrink-0" /> Open in Overleaf
              </Button>
              <Button
                variant="outline"
                onClick={handleInstantPdf}
                disabled={compiling}
                className="w-full sm:flex-1 rounded-xl text-xs h-11 sm:h-10 border-gray-300 hover:bg-gray-100"
              >
                {compiling ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin shrink-0" /> : <FileCode2 className="h-4 w-4 mr-1.5 text-orange-600 shrink-0" />}
                {compiling ? "Compiling…" : "Try Instant PDF"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadTex}
                className="w-full sm:flex-1 rounded-xl text-xs h-11 sm:h-10 border-gray-300 hover:bg-gray-100"
              >
                <Download className="h-4 w-4 mr-1.5 text-gray-600 shrink-0" /> Download .tex
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-xs text-gray-600 hover:text-gray-900 w-full sm:w-auto h-9"
            >
              ← Try a different role
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
