let pdfjsInitialized = false;

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "pdf") return extractPdf(file);
  if (ext === "docx") return extractDocx(file);
  if (ext === "txt") return await file.text();
  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}

async function extractPdf(file: File): Promise<string> {
  const [pdfjsLib, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    // @ts-ignore - vite ?worker import
    import("pdfjs-dist/build/pdf.worker.min.mjs?worker"),
  ]);

  if (!pdfjsInitialized) {
    const PdfWorker = workerModule.default;
    pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();
    pdfjsInitialized = true;
  }

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n\n";
  }
  return text.trim();
}

async function extractDocx(file: File): Promise<string> {
  const { default: mammoth } = await import("mammoth");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value.trim();
}

