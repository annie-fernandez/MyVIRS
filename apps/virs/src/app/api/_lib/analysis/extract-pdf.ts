import "server-only";
import { extractText, getDocumentProxy } from "unpdf";
import { SIGNATURES } from "./file-signatures";
import { matchesAny } from "./matches-any";
import { unreadableFile } from "./unreadable-file";
import { unsupportedFile } from "./unsupported-file";

const MAX_PDF_PAGES = 300;

/** The text of a PDF, all pages merged. */
export async function extractPdf(bytes: Uint8Array): Promise<string> {
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
