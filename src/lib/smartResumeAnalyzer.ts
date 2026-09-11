export interface AnalysisData {
  rewrittenResume: string;
  atsScore: number;
  breakdown: { content: number; keywords: number; format: number; quantification: number };
  weaknesses: { issue: string; severity: "critical" | "warning" | "suggestion"; suggestion: string }[];
  missingKeywords: string[];
  strengths: string[];
  jobMatches: {
    role: string;
    matchPercent: number;
    reasoning: string;
    skillsNeeded: string[];
    salaryRangeIndia: string;
  }[];
}

export interface ExtractedContact {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

const ACTION_VERBS = [
  "Led", "Developed", "Built", "Managed", "Architected", "Implemented", "Increased",
  "Reduced", "Optimized", "Designed", "Delivered", "Accelerated", "Spearheaded",
  "Engineered", "Created", "Transformed", "Automated", "Expanded", "Generated"
];

const COMMON_TECH_KEYWORDS = [
  "React", "TypeScript", "Node.js", "Python", "Java", "SQL", "AWS", "Docker",
  "Kubernetes", "GraphQL", "REST API", "Tailwind CSS", "Next.js", "Git", "CI/CD",
  "MongoDB", "PostgreSQL", "System Design", "Agile", "Microservices"
];

export function extractContactDetails(resumeText: string, fileName: string): ExtractedContact {
  const text = resumeText || "";
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const email = emailMatch ? emailMatch[1].trim() : "";

  // 2. Phone Number
  const phoneMatch = text.match(/(?:\+91[\s-]?)?\b([6-9]\d{9})\b/) ||
                     text.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  let phone = phoneMatch ? phoneMatch[0].trim() : "";
  if (phone && /^\d{10}$/.test(phone)) {
    phone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }

  // 3. LinkedIn URL / Username
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i) ||
                        text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  let linkedin = linkedinMatch ? linkedinMatch[0].trim() : "";
  if (linkedin && !linkedin.startsWith("http")) linkedin = `https://${linkedin}`;

  // 4. GitHub URL / Username
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/i) ||
                      text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  let github = githubMatch ? githubMatch[0].trim() : "";
  if (github && !github.startsWith("http")) github = `https://${github}`;

  // 5. Portfolio / Personal Website
  const emailDomain = email.includes("@") ? email.split("@")[1]?.toLowerCase() ?? "" : "";
  // Academic-degree abbreviations like "B.Tech" / "M.Sc" collide with the ".tech" / ".sc"
  // TLD pattern below, so they must never be treated as a matched "domain".
  const DEGREE_ABBR_RE = /^(b|m|ba|bs|bsc|msc|ma|mba|phd|md|llb|llm|be|me)\.(tech|sc|a|com|ed|eng|d|s)(\.|$)/i;
  const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_-]{3,}\.(?:dev|io|me|app|tech|portfolio|site|com|org|net)\b(?:\/[^\s]*)?/gi) || [];
  let portfolio = "";
  for (const url of urlMatches) {
    const lUrl = url.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
    // Skip known non-portfolio domains, the candidate's own email domain, and
    // false positives from degree abbreviations (e.g. "B.Tech" is not a website).
    if (
      !lUrl.includes("linkedin") &&
      !lUrl.includes("github") &&
      !lUrl.includes("gmail") &&
      !lUrl.includes("prohired") &&
      !(emailDomain && lUrl === emailDomain) &&
      !DEGREE_ABBR_RE.test(lUrl)
    ) {
      portfolio = url.startsWith("http") ? url : `https://${url}`;
      break;
    }
  }

  // 6. Candidate Full Name
  let fullName = "";
  const nameLabelMatch = text.match(/(?:Name|Full Name|Candidate Name|Applicant)\s*:\s*([A-Za-z\s.]{2,35})/i);
  if (nameLabelMatch && nameLabelMatch[1]) {
    fullName = nameLabelMatch[1].trim();
  } else {
    for (const l of lines) {
      const cleanLine = l.replace(/^[#*_\s]+/, "").replace(/[#*_\s]+$/, "").trim();
      if (
        cleanLine &&
        !cleanLine.toLowerCase().includes("resume") &&
        !cleanLine.toLowerCase().includes("curriculum") &&
        !cleanLine.toLowerCase().includes("email") &&
        !cleanLine.toLowerCase().includes("phone") &&
        !cleanLine.toLowerCase().includes("http") &&
        !cleanLine.toLowerCase().includes("location") &&
        !cleanLine.toLowerCase().includes("experience") &&
        !cleanLine.toLowerCase().includes("skills") &&
        cleanLine.length >= 2 &&
        cleanLine.length <= 35
      ) {
        if (/^[a-zA-Z\s.]+$/.test(cleanLine) && !cleanLine.includes("@")) {
          fullName = cleanLine.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
          break;
        }
      }
    }
  }

  if (!fullName && fileName) {
    const base = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const cleanBase = base.replace(/resume|cv|biodata|profile|ats/gi, "").trim();
    if (cleanBase.length >= 2 && /^[a-zA-Z\s.]+$/.test(cleanBase)) {
      fullName = cleanBase.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
  if (!fullName) fullName = "Professional Candidate";

  // 7. Location
  let location = "";
  const locationMatch = text.match(/(?:Location|Address|City)\s*:\s*([A-Za-z0-9\s,.-]{3,40})/i) ||
                        text.match(/\b(Bangalore|Bengaluru|Hyderabad|Mumbai|Delhi|Noida|Gurgaon|Gurugram|Pune|Chennai|Kolkata|Ahmedabad|India)\b/i);
  if (locationMatch) location = locationMatch[1] || locationMatch[0];

  return { fullName, email, phone, location, linkedin, github, portfolio };
}

export interface ParsedResumeSections {
  summary?: string;
  skills: string[];
  experience: string[];
  projects: string[];
  education: string[];
  certifications: string[];
}

// Filters out short, punctuation-free fragments that are almost always leftover
// contact info (name, phone number, city) rather than real summary prose, so they
// don't get mistaken for the professional summary when no explicit "Summary" heading exists.
function looksLikeContactFragment(rawLine: string): boolean {
  const t = rawLine.trim();
  if (!t) return true;
  if (/^[\d\s()+\-]{7,}$/.test(t)) return true; // phone-number-shaped line
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 4 && !/[.!?]$/.test(t)) {
    const hasSentenceWord = /\b(is|are|was|were|have|has|with|and|the|of|in|for|to|led|built|developed|managed|created|years?)\b/i.test(t);
    if (!hasSentenceWord) return true;
  }
  return false;
}

// A line is treated as a section heading only if it is short and reasonably
// resembles a heading (not a long sentence that merely contains the word).
function isLikelyHeadingLine(rawLine: string): boolean {
  const line = rawLine.replace(/^[#*_\-\s]+/, "").replace(/[:\s]+$/, "");
  if (!line) return false;
  if (line.length > 40) return false; // long sentences are body text, not headings
  if (/[.!?]$/.test(line)) return false; // sentences ending in punctuation aren't headings
  return true;
}

export function parseResumeSections(resumeText: string): ParsedResumeSections {
  const lines = (resumeText || "").split(/\r?\n/).map(l => l.trim());
  const sections: ParsedResumeSections = {
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
  };

  let currentSection = "summary";
  let summaryLines: string[] = [];

  for (const line of lines) {
    if (line && isLikelyHeadingLine(line)) {
      const lower = line.toLowerCase().replace(/^[#*_\-\s]+/, "").replace(/[:\s]+$/, "");

      if (lower.includes("summary") || lower.includes("profile") || lower.includes("objective") || lower.includes("about me")) {
        currentSection = "summary";
        continue;
      } else if (lower.includes("skill") || lower.includes("technolog") || lower.includes("expertise") || lower.includes("competenc")) {
        currentSection = "skills";
        continue;
      } else if (lower.includes("experience") || lower.includes("employment") || lower.includes("work history") || lower.includes("career")) {
        currentSection = "experience";
        continue;
      } else if (lower.includes("project") || lower.includes("key projects")) {
        currentSection = "projects";
        continue;
      } else if (lower.includes("education") || lower.includes("qualification") || lower.includes("academic")) {
        currentSection = "education";
        continue;
      } else if (lower.includes("certification") || lower.includes("achievement") || lower.includes("award") || lower.includes("license")) {
        currentSection = "certifications";
        continue;
      }
    }

    // Blank lines are preserved (as "") for the block-structured sections so that
    // entries (job/education/project blocks) can later be told apart from each other.
    if (currentSection === "summary") {
      if (
        line &&
        !line.startsWith("#") &&
        !line.includes("@") &&
        !/linkedin\.com|github\.com/i.test(line) &&
        !looksLikeContactFragment(line)
      ) {
        summaryLines.push(line);
      }
    } else if (currentSection === "skills") {
      if (line) sections.skills.push(line);
    } else if (currentSection === "experience") {
      sections.experience.push(line);
    } else if (currentSection === "projects") {
      sections.projects.push(line);
    } else if (currentSection === "education") {
      sections.education.push(line);
    } else if (currentSection === "certifications") {
      sections.certifications.push(line);
    }
  }

  sections.summary = summaryLines.join(" ").trim();
  return sections;
}

/** Group a section's raw lines (with blank-line separators preserved) into entry blocks. */
function groupIntoBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (current.length) { blocks.push(current); current = []; }
      continue;
    }
    current.push(line);
  }
  if (current.length) blocks.push(current);
  return blocks;
}

/** Detects a trailing date range like "Jan 2022 - Present" / "2019 – 2021" / "(2020-2023)". */
const DATE_TAIL_RE = /[\(\s]((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4}|present)\s*[-–—to]{1,3}\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4}|present)\)?\s*$/i;

/** True for lone lines like "Google" or "Jan 2022 - Present" that read as a company/date
 * meta line rather than an achievement bullet (short, no sentence punctuation, no verb). */
function looksLikeMetaLine(line: string): boolean {
  const t = line.trim();
  if (!t || /^[-*•]/.test(t)) return false;
  if (DATE_TAIL_RE.test(` ${t}`) || /^(present|current)$/i.test(t)) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 6) return false;
  if (/[.!?]$/.test(t)) return false;
  const hasVerbOrDigits = /\b(led|built|developed|managed|created|designed|improved|increased|reduced|drove|delivered)\b/i.test(t) || /\d{2,}/.test(t.replace(DATE_TAIL_RE, ""));
  return !hasVerbOrDigits;
}

/** Convert one entry block (header line + supporting lines) into ATS-friendly markdown. */
function blockToMarkdown(block: string[]): string {
  if (!block.length) return "";
  let header = block[0].replace(/^[-*•]\s*/, "").trim();
  let rest = block.slice(1);

  // If the header line doesn't already contain a separator ( | or — ) but has a
  // trailing date range, split it out so the export renderer can right-align the date.
  if (!header.includes(" | ") && !header.includes(" — ")) {
    const m = header.match(DATE_TAIL_RE);
    if (m && m.index !== undefined && m.index > 0) {
      const title = header.slice(0, m.index).trim().replace(/[,\-–—]\s*$/, "");
      const dates = header.slice(m.index).trim().replace(/^[,\-–—\s]+/, "");
      if (title) header = `${title} | ${dates}`;
    }
  }

  // Pull the 1-2 short lines immediately after the header (e.g. company name, date
  // range) out as meta lines instead of turning them into bogus achievement bullets.
  const metaLines: string[] = [];
  while (rest.length && metaLines.length < 2 && looksLikeMetaLine(rest[0])) {
    metaLines.push(rest[0].trim());
    rest = rest.slice(1);
  }

  const bulletLines: string[] = [];
  for (const l of rest) {
    const t = l.trim();
    if (!t) continue;
    bulletLines.push(/^[-*•]/.test(t) ? `- ${t.replace(/^[-*•]\s*/, "")}` : `- ${t}`);
  }

  const metaMarkdown: string[] = [];
  for (const m of metaLines) {
    if (DATE_TAIL_RE.test(` ${m}`) || /^(present|current)/i.test(m)) metaMarkdown.push(`_${m}_`);
    else metaMarkdown.push(`**${m}**`);
  }

  return [`### ${header}`, ...metaMarkdown, ...bulletLines].join("\n");
}

/** Turn a section's raw (blank-line-preserved) lines into clean, ATS-structured markdown. */
function sectionToStructuredMarkdown(lines: string[]): string {
  const blocks = groupIntoBlocks(lines);
  return blocks.map(blockToMarkdown).filter(Boolean).join("\n\n");
}

export function generateSmartResumeAnalysis(resumeText: string, fileName: string): AnalysisData {
  const text = resumeText || "";
  const contact = extractContactDetails(text, fileName);
  const parsedSections = parseResumeSections(text);

  // 1. Analyze Action Verbs
  const foundVerbs = ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, "i").test(text));
  const verbCount = foundVerbs.length;

  // 2. Analyze Quantification (Numbers & Percentages)
  const numbersMatch = text.match(/\b\d+(?:%|k|M|\+|\s*percent|\s*users|\s*LPA|\s*hrs|\s*team)?\b/gi) || [];
  const quantScore = Math.min(100, Math.max(45, numbersMatch.length * 8 + 35));

  // 3. Analyze Keywords
  const foundKeywords = COMMON_TECH_KEYWORDS.filter(k => new RegExp(`\\b${k.replace('.', '\\.')}\\b`, "i").test(text));
  const missingKeywords = COMMON_TECH_KEYWORDS.filter(k => !foundKeywords.includes(k)).slice(0, 6);
  const keywordScore = Math.min(100, Math.max(50, foundKeywords.length * 7 + 40));

  // 4. Content & Format Scoring
  const lengthScore = Math.min(100, Math.max(40, Math.floor(text.length / 25)));
  const formatScore = text.includes("Experience") || text.includes("Education") || text.includes("Skills") ? 88 : 65;
  const contentScore = Math.min(100, Math.round((verbCount * 6) + (lengthScore * 0.4) + 40));

  // Overall ATS Score calculation
  const atsScore = Math.round((contentScore * 0.3) + (keywordScore * 0.3) + (quantScore * 0.2) + (formatScore * 0.2));

  // Weaknesses identification
  const weaknesses: AnalysisData["weaknesses"] = [];
  if (numbersMatch.length < 4) {
    weaknesses.push({
      issue: "Low Metrics & Quantification",
      severity: "critical",
      suggestion: "Add specific metrics to bullet points (e.g. 'Improved performance by 35%', 'Managed 5+ team members')."
    });
  }
  if (verbCount < 5) {
    weaknesses.push({
      issue: "Weak Action Verbs",
      severity: "warning",
      suggestion: "Start bullet points with strong action verbs like Led, Architected, Spearheaded, or Accelerated."
    });
  }
  if (missingKeywords.length > 3) {
    weaknesses.push({
      issue: "Missing In-Demand Keywords",
      severity: "warning",
      suggestion: `Consider including keywords such as ${missingKeywords.slice(0, 3).join(", ")} where applicable.`
    });
  }
  if (!parsedSections.summary || parsedSections.summary.length < 30) {
    weaknesses.push({
      issue: "Missing Professional Summary",
      severity: "suggestion",
      suggestion: "Add a 3-4 line impact-focused professional summary at the top of your resume."
    });
  }

  // Strengths
  const strengths: string[] = [];
  if (foundKeywords.length >= 3) {
    strengths.push(`Strong technical skill coverage (${foundKeywords.slice(0, 4).join(", ")})`);
  }
  if (verbCount >= 3) {
    strengths.push("Good usage of active lead verbs throughout experience items");
  }
  if (numbersMatch.length >= 3) {
    strengths.push("Includes measurable results and numbers");
  }
  if (strengths.length === 0) {
    strengths.push("Clean text structure readable by ATS parsers");
  }

  // Role detection
  let domain = "Software Engineer";
  if (/react|frontend|css|html|next|tailwind/i.test(text)) domain = "Frontend / Fullstack Developer";
  else if (/python|data|sql|machine|analysis/i.test(text)) domain = "Data Engineer / Analyst";
  else if (/aws|docker|kubernetes|devops|cloud/i.test(text)) domain = "DevOps / Cloud Engineer";
  else if (/java|node|backend|postgres|api/i.test(text)) domain = "Backend / Systems Engineer";

  // Job Matches
  const jobMatches: AnalysisData["jobMatches"] = [
    {
      role: domain,
      matchPercent: Math.min(96, atsScore + 8),
      reasoning: "Your existing skill set and project experience align directly with core requirements for this position.",
      skillsNeeded: foundKeywords.slice(0, 4),
      salaryRangeIndia: "₹10 - 22 LPA"
    },
    {
      role: "Senior Software Development Engineer (SDE)",
      matchPercent: Math.min(92, atsScore + 2),
      reasoning: "Demonstrates practical execution capability with relevant modern tools and system workflows.",
      skillsNeeded: ["System Design", ...missingKeywords.slice(0, 2)],
      salaryRangeIndia: "₹14 - 28 LPA"
    },
    {
      role: "Technical Lead / Module Lead",
      matchPercent: Math.min(86, atsScore - 4),
      reasoning: "Strong background for taking ownership of features and delivering production-ready applications.",
      skillsNeeded: ["Architecture", "Team Leadership"],
      salaryRangeIndia: "₹18 - 32 LPA"
    },
    {
      role: "Full Stack Web Engineer",
      matchPercent: Math.min(84, atsScore - 6),
      reasoning: "Matches end-to-end web architecture stack and modern deployment workflows.",
      skillsNeeded: ["REST APIs", "Cloud Infrastructure"],
      salaryRangeIndia: "₹9 - 18 LPA"
    },
    {
      role: "Product & Solutions Specialist",
      matchPercent: Math.min(78, atsScore - 12),
      reasoning: "Good technical baseline with adaptable problem-solving skills across enterprise workflows.",
      skillsNeeded: ["Product Strategy", "API Integration"],
      salaryRangeIndia: "₹12 - 20 LPA"
    }
  ];

  // Build Contact Bar Markdown — a single clean line, standard ATS format
  // (plain values separated by " | ", no verbose labels, real hyperlinks preserved).
  const contactParts: string[] = [];
  if (contact.location) contactParts.push(contact.location);
  if (contact.phone) contactParts.push(contact.phone);
  if (contact.email) contactParts.push(`[${contact.email}](mailto:${contact.email})`);
  if (contact.linkedin) contactParts.push(`[LinkedIn](${contact.linkedin})`);
  if (contact.github) contactParts.push(`[GitHub](${contact.github})`);
  if (contact.portfolio) contactParts.push(`[Portfolio](${contact.portfolio})`);

  const contactHeaderLine = contactParts.join(" | ");

  // Summary
  const summaryText = parsedSections.summary && parsedSections.summary.length > 30
    ? parsedSections.summary
    : `Results-driven ${domain} with proven expertise in building high-performance applications, optimizing system architectures, and delivering measurable business impact. Adept at end-to-end software development, cross-functional engineering collaboration, and applying industry best practices.`;

  // Technical Skills
  const skillsText = parsedSections.skills.length > 0
    ? parsedSections.skills.map(s => s.replace(/^[-*]\s*/, "")).join(", ")
    : (foundKeywords.length ? foundKeywords.join(", ") : "JavaScript, TypeScript, React, Node.js, SQL, REST APIs, Git");

  // Experience — grouped into distinct "### Role | Dates" entries with bullet points,
  // matching the exact structure the preview/PDF/DOCX renderers expect.
  let expMarkdown = "";
  if (parsedSections.experience.some(l => l.trim())) {
    expMarkdown = sectionToStructuredMarkdown(parsedSections.experience);
  } else {
    // Extract non-header text lines from candidate's text without inventing fake companies
    const rawLines = text.split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 15 && !l.startsWith("#") && !/skills|education|contact|phone|email/i.test(l));
    if (rawLines.length > 0) {
      expMarkdown = [`### Professional Experience`, ...rawLines.slice(0, 8).map(l => l.startsWith("-") ? l : `- ${l}`)].join("\n");
    } else {
      expMarkdown = `*Work experience details as specified in original candidate document.*`;
    }
  }

  // Projects
  let projectsMarkdown = "";
  if (parsedSections.projects.some(l => l.trim())) {
    projectsMarkdown = sectionToStructuredMarkdown(parsedSections.projects);
  }

  // Education
  let eduMarkdown = "";
  if (parsedSections.education.some(l => l.trim())) {
    eduMarkdown = sectionToStructuredMarkdown(parsedSections.education);
  } else {
    // Check if degree/school mentioned in text
    const eduLines = text.split("\n")
      .map(l => l.trim())
      .filter(l => /b\.?tech|b\.?e|b\.?sc|m\.?tech|m\.?s|bachelor|master|degree|university|college|school|diploma/i.test(l));
    if (eduLines.length > 0) {
      eduMarkdown = eduLines.map(l => `### ${l}`).join("\n\n");
    } else {
      eduMarkdown = `*Education & Qualification details as specified in original candidate document.*`;
    }
  }

  // Certifications
  let certsMarkdown = "";
  if (parsedSections.certifications.some(l => l.trim())) {
    const certLines = parsedSections.certifications.filter(l => l.trim()).map(l => l.replace(/^[-*•]\s*/, ""));
    certsMarkdown = `\n\n---\n\n## CERTIFICATIONS & ACHIEVEMENTS\n` + certLines.map(l => `- ${l}`).join("\n");
  }

  const rewrittenResume = `# ${contact.fullName.toUpperCase()}
${contactHeaderLine}

---

## PROFESSIONAL SUMMARY
${summaryText}

---

## TECHNICAL SKILLS
- **Core Technologies & Frameworks:** ${skillsText}
- **Tools & Infrastructure:** Git, REST APIs, CI/CD, Microservices, Cloud Architecture
- **Key Competencies:** System Design, Performance Optimization, Code Quality, Agile Methodologies

---

## PROFESSIONAL EXPERIENCE
${expMarkdown}

${projectsMarkdown ? `---\n\n## KEY PROJECTS\n${projectsMarkdown}\n` : ""}---

## EDUCATION
${eduMarkdown}${certsMarkdown}`.trim();

  return {
    rewrittenResume,
    atsScore,
    breakdown: {
      content: contentScore,
      keywords: keywordScore,
      format: formatScore,
      quantification: quantScore,
    },
    weaknesses,
    missingKeywords,
    strengths,
    jobMatches,
  };
}
