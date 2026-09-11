import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TabStopType, TabStopPosition,
} from "docx";
import { saveAs } from "file-saver";

/** Convert a markdown resume string into a clean, printable HTML document and trigger the print dialog. */
export function downloadAsPDF(markdownText: string, name: string) {
  const html = markdownToResumeHTML(markdownText, name);
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    alert("Please allow pop-ups to download as PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  // Give the new window a moment to render before invoking print.
  setTimeout(() => {
    try { win.focus(); win.print(); } catch { /* no-op */ }
  }, 350);
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Placeholder markers use Private-Use-Area characters (never appear in real resume text and
// contain no "_" or "*"), so the bold/italic regexes below can't accidentally mangle them —
// the previous "___LINK_PLACEHOLDER_n___" markers were themselves matched by the italic
// regex, which is what corrupted every hyperlink in the contact line.
const LINK_OPEN = "\uE000";
const LINK_CLOSE = "\uE001";

function inlineFormat(line: string): string {
  // First convert markdown links [Label](URL) to placeholder tags before escaping HTML
  const links: { label: string; url: string }[] = [];
  const withPlaceholders = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const idx = links.length;
    links.push({ label, url });
    return `${LINK_OPEN}${idx}${LINK_CLOSE}`;
  });

  let escaped = escapeHTML(withPlaceholders)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");

  // Restore links with clickable anchor tags
  links.forEach((l, i) => {
    const linkHTML = `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener noreferrer" class="ats-link">${escapeHTML(l.label)}</a>`;
    escaped = escaped.replace(`${LINK_OPEN}${i}${LINK_CLOSE}`, linkHTML);
  });

  return escaped;
}

// ---------- Shared header-line splitting (used by both HTML and DOCX renderers) ----------
// Detects a trailing date range like "Jan 2022 - Present" / "2019 - 2021" / "(2020-2023)"
// so a single freeform "### Job Title Company 2020 - 2023" line can still be split into a
// left-aligned title and a right-aligned date, which is what ATS parsers and recruiters expect.
const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s*";
const DATE_TAIL_RE = new RegExp(
  `[\\(\\s](${MONTH})?(\\d{4}|present)\\s*[-\u2013\u2014to]{1,3}\\s*(${MONTH})?(\\d{4}|present)\\)?\\s*$`,
  "i"
);

/** Split a "### " header line into a left title and a right meta (dates/location), if present. */
function splitHeaderLine(raw: string): { title: string; meta: string } {
  const content = raw.trim();
  for (const sep of [" | ", " — ", " – "]) {
    if (content.includes(sep)) {
      const idx = content.indexOf(sep);
      return { title: content.slice(0, idx).trim(), meta: content.slice(idx + sep.length).trim() };
    }
  }
  const m = content.match(DATE_TAIL_RE);
  if (m && m.index !== undefined && m.index > 0) {
    return {
      title: content.slice(0, m.index).trim().replace(/[,\-\u2013\u2014]\s*$/, ""),
      meta: content.slice(m.index).trim(),
    };
  }
  return { title: content, meta: "" };
}

function isWholeLineBold(line: string): boolean {
  return /^\*\*[^*]+\*\*$/.test(line.trim());
}

function isWholeLineItalic(line: string): boolean {
  const t = line.trim();
  return t.length > 2 && t.startsWith("_") && t.endsWith("_") && !t.slice(1, -1).includes("_");
}

export function markdownToResumeHTML(md: string, name: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  let hasHeader = false;

  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };

  // Parse header first (Name and Contact)
  let nameStr = "";
  let contactStr = "";
  let startIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("# ")) {
      nameStr = line.slice(2).trim();
      startIndex = i + 1;
      for (let j = startIndex; j < lines.length; j++) {
        const next = lines[j].trim();
        if (next && !next.startsWith("#") && !next.startsWith("---")) {
          contactStr = next;
          startIndex = j + 1;
          break;
        }
      }
      hasHeader = true;
      break;
    }
  }

  // Process remaining content
  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i].trimEnd();
    const line = raw.trim();
    if (!line) { closeList(); continue; }

    if (line === "---" || line === "***" || line === "___") {
      closeList();
      out.push(`<hr class="section-divider" />`);
    } else if (line.startsWith("## ")) {
      closeList();
      out.push(`<h2 class="section-title">${inlineFormat(line.slice(3).trim())}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      const { title, meta } = splitHeaderLine(line.slice(4).trim());
      if (meta) {
        out.push(`<div class="header-row"><h3>${inlineFormat(title)}</h3><span class="date">${inlineFormat(meta)}</span></div>`);
      } else {
        out.push(`<h3>${inlineFormat(title)}</h3>`);
      }
    } else if (isWholeLineItalic(line)) {
      out.push(`<p class="meta-date">${inlineFormat(line.replace(/^_|_$/g, ""))}</p>`);
    } else if (isWholeLineBold(line)) {
      out.push(`<p class="entry-subtitle">${inlineFormat(line)}</p>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else {
      closeList();
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }
  closeList();

  const headerHTML = hasHeader ? `
    <header class="resume-header">
      <h1>${escapeHTML(nameStr)}</h1>
      <div class="contact-info">${inlineFormat(contactStr)}</div>
    </header>
  ` : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHTML(name)} — Resume</title>
<style>
  @page { size: Letter; margin: 0.6in; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { background: #ffffff; color: #1a1a1a; margin: 0; padding: 0; }
  /* System-font stack only: no external font fetch, so the print window renders instantly
     and every heading/body run stays real, ATS-selectable text (not an image). */
  body {
    font-family: Calibri, Carlito, Arial, "Helvetica Neue", Helvetica, sans-serif;
    font-size: 10.5pt;
    line-height: 1.42;
  }

  .resume { width: 100%; max-width: 8.5in; margin: 0 auto; background: white; padding: 0; }

  .resume-header { text-align: center; padding-bottom: 12px; border-bottom: 2px solid #14243d; margin-bottom: 14px; }
  .resume-header h1 { font-size: 21pt; font-weight: 700; color: #14243d; margin: 0 0 6px 0; letter-spacing: 0.01em; }
  .contact-info { font-size: 9.5pt; color: #333333; font-weight: 400; line-height: 1.5; }
  .contact-info a.ats-link { color: #14243d; text-decoration: underline; }
  .contact-info strong { color: #1a1a1a; }

  .section-divider { display: none; } /* section-title borders already provide visual separation */

  .section-title {
    font-size: 11.5pt;
    font-weight: 700;
    color: #14243d;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 14px 0 6px;
    padding-bottom: 2px;
    border-bottom: 1px solid #14243d;
  }
  .section-title:first-of-type { margin-top: 0; }

  .header-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px; margin-top: 9px; margin-bottom: 0; }
  h3 { font-size: 10.75pt; font-weight: 700; color: #1a1a1a; margin: 0; }
  .date { font-size: 9.5pt; font-weight: 400; color: #333333; white-space: nowrap; }

  .entry-subtitle { margin: 1px 0 3px 0; font-size: 9.75pt; font-weight: 600; color: #333333; }
  .meta-date { margin: 0 0 3px 0; font-size: 9.5pt; font-style: italic; color: #4d4d4d; }

  p { margin: 4px 0; color: #1a1a1a; }
  ul { margin: 3px 0 9px 20px; padding: 0; list-style-type: disc; }
  li { margin: 2px 0; padding-left: 2px; color: #1a1a1a; }

  strong { font-weight: 700; color: #1a1a1a; }
  a.ats-link { color: #14243d; text-decoration: underline; }

  @media print {
    body { padding: 0; background: white; }
    .resume { width: 100%; max-width: 100%; padding: 0; box-shadow: none; }
    a.ats-link { color: #14243d !important; text-decoration: underline !important; }
    .section-title, h3 { break-after: avoid; }
    li, .entry-subtitle, .meta-date { break-inside: avoid; }
  }
</style></head>
<body>
  <div class="resume">
    ${headerHTML}
    <div class="content-body">
      ${out.join("\n")}
    </div>
  </div>
</body></html>`;
}

// ---------- DOCX ----------

interface ParsedSection { heading: string; lines: string[]; }

function parseSections(md: string): { name: string; intro: string[]; sections: ParsedSection[] } {
  const lines = md.split(/\r?\n/);
  let name = "";
  const intro: string[] = [];
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) continue;
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") continue;
    if (line.startsWith("# ")) { name = line.slice(2).trim(); continue; }
    if (line.startsWith("## ")) {
      current = { heading: line.slice(3).trim().toUpperCase(), lines: [] };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(line);
    else intro.push(line);
  }

  return { name, intro, sections };
}

// ATS-safe, universally-installed font. Avoids exotic fonts that some parsers or
// printers may not recognize, keeping every character machine-readable text.
const FONT = "Calibri";
const NAVY = "14243D";
const GRAY_LINE = "B0B0B0";
const GRAY_TEXT = "4D4D4D";

/** Convert "[Label](url)" markdown links into plain "Label (url)" text — DOCX has no
 * markdown-link renderer, so without this the raw "[...](...)" syntax would print
 * verbatim, which is neither professional nor ATS-friendly. */
function flattenMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => {
    const cleanUrl = url.replace(/^mailto:/, "");
    return label.trim() === cleanUrl.trim() ? cleanUrl.trim() : `${label.trim()} (${cleanUrl.trim()})`;
  });
}

function inlineRuns(text: string, base: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}): TextRun[] {
  const flattened = flattenMarkdownLinks(text);
  // Tokenize **bold** and _italic_ / *italic*
  const runs: TextRun[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (s: string, opts: { bold?: boolean; italics?: boolean }) => {
    if (!s) return;
    runs.push(new TextRun({ text: s, font: FONT, size: base.size ?? 22, color: base.color, bold: opts.bold ?? base.bold, italics: opts.italics ?? base.italics }));
  };
  while ((m = regex.exec(flattened)) !== null) {
    push(flattened.slice(last, m.index), {});
    const tok = m[0];
    if (tok.startsWith("**")) push(tok.slice(2, -2), { bold: true });
    else push(tok.slice(1, -1), { italics: true });
    last = m.index + tok.length;
  }
  push(flattened.slice(last), {});
  if (runs.length === 0) push(flattened, {});
  return runs;
}

function paragraphForLine(line: string): Paragraph {
  const trimmed = line.trim();

  if (/^[-*]\s+/.test(trimmed)) {
    const txt = trimmed.replace(/^[-*]\s+/, "");
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 30, after: 30 },
      children: inlineRuns(txt),
    });
  }

  if (/^###\s+/.test(trimmed)) {
    const { title, meta } = splitHeaderLine(trimmed.replace(/^###\s+/, ""));
    if (meta) {
      return new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { before: 160, after: 20 },
        children: [
          ...inlineRuns(title, { bold: true, size: 23 }),
          new TextRun({ text: "\t", font: FONT }),
          new TextRun({ text: meta, font: FONT, size: 19, color: GRAY_TEXT }),
        ],
      });
    }
    return new Paragraph({
      spacing: { before: 160, after: 20 },
      children: inlineRuns(title, { bold: true, size: 23 }),
    });
  }

  if (isWholeLineBold(trimmed)) {
    return new Paragraph({
      spacing: { before: 0, after: 40 },
      children: inlineRuns(trimmed.slice(2, -2), { bold: true, size: 20, color: GRAY_TEXT }),
    });
  }

  if (isWholeLineItalic(trimmed)) {
    return new Paragraph({
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: trimmed.slice(1, -1), font: FONT, italics: true, size: 19, color: GRAY_TEXT })],
    });
  }

  return new Paragraph({
    spacing: { before: 30, after: 30 },
    children: inlineRuns(trimmed),
  });
}

/** Build & download a real .docx from the markdown resume. */
export async function downloadAsDOCX(markdownText: string, name: string) {
  const parsed = parseSections(markdownText);

  const children: Paragraph[] = [];

  // Header (name)
  if (parsed.name) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: parsed.name, font: FONT, size: 42, bold: true, color: NAVY })],
    }));
  }

  // Intro / contact lines
  for (const line of parsed.intro) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: NAVY, space: 8 } },
      children: inlineRuns(line, { size: 19, color: "333333" }),
    }));
  }

  // Sections
  for (const sec of parsed.sections) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 220, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GRAY_LINE, space: 2 } },
      children: [new TextRun({ text: sec.heading, font: FONT, size: 23, bold: true, color: NAVY, allCaps: true })],
    }));
    for (const line of sec.lines) {
      children.push(paragraphForLine(line));
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 1080, bottom: 720, left: 1080 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${(name || "resume").replace(/\.[^.]+$/, "")}.docx`);
}
