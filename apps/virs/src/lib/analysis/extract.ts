import "server-only";
import { DetectDocumentTextCommand, TextractClient } from "@aws-sdk/client-textract";
import { ANALYZABLE_FILE_KINDS, type AnalyzableFileKind } from "@repo/core";
import { extractText, getDocumentProxy } from "unpdf";
import WordExtractor from "word-extractor";
import { env } from "../env";
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
  image: [
    [0xff, 0xd8, 0xff],
    [0x89, 0x50, 0x4e, 0x47],
  ],
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

let textract: TextractClient | undefined;

async function extractImage(bytes: Uint8Array): Promise<string> {
  if (!matchesAny(bytes, SIGNATURES.image)) throw unsupportedFile("Images must be JPEG or PNG.");
  textract ??= new TextractClient({ region: env().AWS_REGION });
  const result = await textract.send(new DetectDocumentTextCommand({ Document: { Bytes: bytes } }));
  return (result.Blocks ?? [])
    .filter((block) => block.BlockType === "LINE" && block.Text)
    .map((block) => block.Text)
    .join("\n");
}

/** Extracts plain text from an uploaded file. Throws HttpError for invalid or unreadable input. */
export async function extractTextFromFile(file: File, kind: AnalyzableFileKind): Promise<string> {
  validateUpload(file, kind);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const text =
    kind === "pdf"
      ? await extractPdf(bytes)
      : kind === "document"
        ? await extractDocument(bytes, file.name)
        : await extractImage(bytes);

  if (!text.trim()) {
    throw unreadableFile(
      kind === "pdf"
        ? "No text found. Scanned PDFs are not supported; upload the pages as images instead."
        : "No text could be found in the file.",
    );
  }
  return text;
}
