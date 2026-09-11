// Deterministic LaTeX renderer for tailored resumes.
//
// WHY THIS EXISTS (read before "simplifying" it):
// Asking an LLM to freehand a full .tex document is the #1 reason AI-generated
// LaTeX fails to compile on Overleaf: unescaped "%", "&", "$", "#", "_", "^",
// stray braces, or a hallucinated \usepackage that isn't in the base TeXLive
// image all produce a red compile error the user can't fix. Instead, the AI's
// only job is to produce plain-text CONTENT tailored to a role (see
// generate-tailored-resume edge function). This module is the only thing that
// ever emits LaTeX syntax, using a single hand-verified template + programmatic
// escaping — so every resume this produces is guaranteed to compile.

export interface TailoredExperienceEntry {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
}

export interface TailoredProjectEntry {
  name: string;
  stack?: string;
  bullets: string[];
}

export interface TailoredEducationEntry {
  degree: string;
  institution: string;
  year?: string;
}

export interface TailoredResumeData {
  name: string;
  location?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  skills: string[];
  experience: TailoredExperienceEntry[];
  projects?: TailoredProjectEntry[];
  education: TailoredEducationEntry[];
  certifications?: string[];
}

/** Escape the ~10 LaTeX special characters. Order matters (backslash first). */
export function escapeLatex(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([%&$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function hrefOrPlain(url: string | undefined, label?: string): string {
  if (!url) return "";
  const clean = url.replace(/^mailto:/, "");
  const target = /^https?:\/\//i.test(clean) || url.startsWith("mailto:") ? url : `https://${clean}`;
  return `\\href{${escapeLatex(target).replace(/\\_/g, "_")}}{${escapeLatex(label ?? clean)}}`;
}

function joinContactLine(d: TailoredResumeData): string {
  const parts: string[] = [];
  if (d.location) parts.push(escapeLatex(d.location));
  if (d.phone) parts.push(escapeLatex(d.phone));
  if (d.email) parts.push(hrefOrPlain(`mailto:${d.email}`, d.email));
  if (d.linkedin) parts.push(hrefOrPlain(d.linkedin, "LinkedIn"));
  if (d.github) parts.push(hrefOrPlain(d.github, "GitHub"));
  if (d.portfolio) parts.push(hrefOrPlain(d.portfolio, "Portfolio"));
  return parts.join(" $\\vert$ ");
}

function renderBullets(bullets: string[]): string {
  if (!bullets?.length) return "";
  const items = bullets.map((b) => `    \\item ${escapeLatex(b)}`).join("\n");
  return `  \\begin{itemize}[itemsep=1pt, topsep=2pt, parsep=0pt, leftmargin=14pt]\n${items}\n  \\end{itemize}\n`;
}

function renderExperience(entries: TailoredExperienceEntry[]): string {
  return entries
    .map((e) => {
      const meta = [e.company, e.location].filter(Boolean).map(escapeLatex).join(", ");
      return [
        `\\entryheader{${escapeLatex(e.title)}}{${escapeLatex(e.dates)}}`,
        meta ? `\\entrysubheader{${meta}}` : "",
        renderBullets(e.bullets),
      ].filter(Boolean).join("\n");
    })
    .join("\n\\vspace{4pt}\n");
}

function renderProjects(entries: TailoredProjectEntry[]): string {
  return entries
    .map((p) => {
      const header = p.stack ? `${escapeLatex(p.name)} \\textbar\\ \\textit{${escapeLatex(p.stack)}}` : escapeLatex(p.name);
      return [`\\entryheader{${header}}{}`, renderBullets(p.bullets)].filter(Boolean).join("\n");
    })
    .join("\n\\vspace{4pt}\n");
}

function renderEducation(entries: TailoredEducationEntry[]): string {
  return entries
    .map((e) => `\\entryheader{${escapeLatex(e.degree)}}{${escapeLatex(e.year ?? "")}}\n\\entrysubheader{${escapeLatex(e.institution)}}`)
    .join("\n\\vspace{2pt}\n");
}

/**
 * Renders a one-page, single-column, ATS-safe LaTeX resume.
 * Only standard, always-present TeXLive packages are used (geometry, titlesec,
 * enumitem, hyperref, xcolor) so it compiles on Overleaf, texlive.net, or any
 * pdflatex install with zero missing-package errors.
 */
export function buildLatexResume(data: TailoredResumeData, targetRole?: string): string {
  const contactLine = joinContactLine(data);
  const skillsLine = (data.skills ?? []).map((s) => escapeLatex(s)).join(", ");
  const certsBlock = data.certifications?.length
    ? `\\section{Certifications}\n\\begin{itemize}[itemsep=1pt, topsep=2pt, parsep=0pt, leftmargin=14pt]\n${data.certifications
        .map((c) => `  \\item ${escapeLatex(c)}`)
        .join("\n")}\n\\end{itemize}\n`
    : "";
  const projectsBlock = data.projects?.length
    ? `\\section{Key Projects}\n${renderProjects(data.projects)}\n`
    : "";

  return `% ATS-friendly one-page resume${targetRole ? ` — tailored for: ${targetRole.replace(/[\r\n]/g, " ")}` : ""}
% Generated by ProHired. Open this project in Overleaf and click Recompile.
\\documentclass[10.5pt,letterpaper]{article}
\\usepackage[left=0.6in,right=0.6in,top=0.5in,bottom=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}
\\usepackage{textcomp}

\\definecolor{navy}{HTML}{14243D}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}{\\large\\bfseries\\color{navy}}{}{0em}{}[\\vspace{-2pt}\\color{navy}\\titlerule\\vspace{2pt}]
\\titlespacing*{\\section}{0pt}{10pt}{4pt}

\\newcommand{\\entryheader}[2]{%
  \\noindent\\textbf{#1}\\hfill{\\small\\color[HTML]{333333}#2}\\\\[1pt]%
}
\\newcommand{\\entrysubheader}[1]{%
  \\noindent{\\small\\itshape\\color[HTML]{4D4D4D}#1}\\\\[2pt]%
}

\\begin{document}

\\begin{center}
  {\\Huge\\bfseries\\color{navy} ${escapeLatex(data.name)}}\\\\[4pt]
  {\\small ${contactLine}}
\\end{center}
\\vspace{2pt}

\\section{Professional Summary}
${escapeLatex(data.summary)}

\\section{Technical Skills}
${skillsLine}

\\section{Professional Experience}
${renderExperience(data.experience)}

${projectsBlock}\\section{Education}
${renderEducation(data.education)}

${certsBlock}\\end{document}
`;
}
