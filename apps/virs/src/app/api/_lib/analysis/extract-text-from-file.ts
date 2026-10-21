import "server-only";
import type { AnalyzableFileKind } from "@repo/core";
import { HttpError } from "../http/http-error";
import { extractDocument } from "./extract-document";
import { extractPdf } from "./extract-pdf";
import { unreadableFile } from "./unreadable-file";
import { validateUpload } from "./validate-upload";

/** Extracts plain text from an uploaded PDF or Word file. Images are read in the browser. */
export async function extractTextFromFile(file: File, kind: AnalyzableFileKind): Promise<string> {
  if (kind === "image") {
    throw new HttpError(
      400,
      "use_browser_ocr",
      "Images are read in the browser. Send the extracted text to /api/analyze/text.",
    );
  }

  validateUpload(file, kind);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const text = kind === "pdf" ? await extractPdf(bytes) : await extractDocument(bytes, file.name);

  if (!text.trim()) {
    throw unreadableFile(
      kind === "pdf"
        ? "No text found. Scanned PDFs are not supported; upload the pages as images instead."
        : "No text could be found in the file.",
    );
  }
  return text;
}
