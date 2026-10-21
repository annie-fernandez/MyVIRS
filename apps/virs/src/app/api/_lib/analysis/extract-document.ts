import "server-only";
import WordExtractor from "word-extractor";
import { SIGNATURES } from "./file-signatures";
import { matchesAny } from "./matches-any";
import { unreadableFile } from "./unreadable-file";
import { unsupportedFile } from "./unsupported-file";

/** The text of a .doc, .docx or .txt file. */
export async function extractDocument(bytes: Uint8Array, filename: string): Promise<string> {
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
