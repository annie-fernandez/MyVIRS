import "server-only";
import { ANALYZABLE_FILE_KINDS, type AnalyzableFileKind } from "@repo/core";
import { extractText, getDocumentProxy } from "unpdf";
import WordExtractor from "word-extractor";
import { HttpError } from "../api/http";

const MAX_PDF_PAGES = 300;

const unsupportedFile = (message: string) => new HttpError(415, "unsupported_file", message);
const unreadableFile = (message: string) => new HttpError(422, "unreadable_file", message);

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, i) => bytes[i] === byte);
}

const SIGNATURES = {
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  doc: [[0xd0, 0xcf, 0x11, 0xe0]],
  docx: [[0x50, 0x4b, 0x03, 0x04]],
} satisfies Record<string, number[][]>;

function matchesAny(bytes: Uint8Array, signatures: number[][]): boolean {
  return signatures.some((signature) => startsWith(bytes, signature));
}

export function validateUpload(file: File, kind: AnalyzableFileKind): void {
  const rules = ANALYZABLE_FILE_KINDS[kind];
  const name = file.name.toLowerCase();
  if (!rules.extensions.some((extension) => name.endsWith(extension))) {
    throw unsupportedFile(`${rules.label} files must end in ${rules.extensions.join(", ")}.`);
  }
  if (file.size === 0) throw unreadableFile("The file is empty.");
  if (file.size > rules.maxBytes) {
    throw new HttpError(
      413,
      "file_too_large",
      `${rules.label} files can be at most ${Math.round(rules.maxBytes / 1024 / 1024)} MB.`,
    );
  }
}

async function extractPdf(bytes: Uint8Array): Promise<string> {
  if (!matchesAny(bytes, SIGNATURES.pdf)) throw unsupportedFile("The file is not a valid PDF.");
  const pdf = await getDocumentProxy(bytes).catch(() => {
    throw unreadableFile("We were unable to open this PDF.");
  });
  if (pdf.numPages > MAX_PDF_PAGES) {
    throw unreadableFile(`PDFs can have at most ${MAX_PDF_PAGES} pages.`);
  }
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

async function extractDocument(bytes: Uint8Array, filename: string): Promise<string> {
  if (filename.toLowerCase().endsWith(".txt")) {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
  if (!matchesAny(bytes, [...SIGNATURES.doc, ...SIGNATURES.docx])) {
    throw unsupportedFile("The file is not a valid Word document.");
  }
  const document = await new WordExtractor().extract(Buffer.from(bytes)).catch(() => {
    throw unreadableFile("We were unable to read this document.");
  });
  return document.getBody();
}

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
