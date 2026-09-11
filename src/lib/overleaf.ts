// Hands a LaTeX source string off to Overleaf using Overleaf's own documented
// "Open in Overleaf" integration (https://www.overleaf.com/devs) — a plain
// HTML form POST with the source in a "snip" field. Overleaf creates a new
// project pre-loaded with the file and the user hits "Recompile" there.
//
// This is the actual "Overleaf compiles the LaTeX into a PDF" step: we don't
// (and can't, without an Overleaf API key) compile on Overleaf's servers
// ourselves, so we open the real editor instead of faking it.
export function openInOverleaf(latexSource: string, projectName = "resume") {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://www.overleaf.com/docs";
  form.target = "_blank";
  form.style.display = "none";

  const snipField = document.createElement("input");
  snipField.type = "hidden";
  snipField.name = "snip";
  snipField.value = latexSource;
  form.appendChild(snipField);

  const nameField = document.createElement("input");
  nameField.type = "hidden";
  nameField.name = "snip_name";
  nameField.value = `${projectName.replace(/[^a-z0-9-_]+/gi, "_") || "resume"}.tex`;
  form.appendChild(nameField);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

/** Trigger a browser download of the raw .tex source (for manual upload anywhere, or as a fallback if pop-ups are blocked). */
export function downloadTexFile(latexSource: string, projectName = "resume") {
  const blob = new Blob([latexSource], { type: "text/x-tex;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.replace(/[^a-z0-9-_]+/gi, "_") || "resume"}.tex`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
