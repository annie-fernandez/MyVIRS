import { MAX_EXTRACTED_TEXT_LENGTH, type AnalyzableFileKind } from "@repo/core";
import { analyze } from "@/app/api/_lib/analysis/analyze";
import { extractTextFromFile } from "@/app/api/_lib/analysis/extract-text-from-file";
import { saveToHistory } from "@/app/api/_lib/analysis/save-to-history";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { toLegacyText } from "@/app/api/_lib/legacy/to-legacy-text";

export const maxDuration = 60;

const KINDS: Record<string, AnalyzableFileKind> = { PDF: "pdf", DOC: "document", IMG: "image" };

/** Legacy UI: POST /api/analyzeFile?type=PDF|DOC with a multipart `file`. IMG is rejected; the browser reads images. */
export const POST = apiRoute(async (request) => {
  const kind = KINDS[request.nextUrl.searchParams.get("type") ?? ""];
  if (!kind) throw HttpError.badRequest("type must be PDF, DOC or IMG.");

  const form = await request.formData().catch(() => {
    throw HttpError.badRequest("Expected multipart/form-data.");
  });
  const file = form.get("file");
  if (!(file instanceof File)) throw HttpError.badRequest("A file is required.");

  const text = await extractTextFromFile(file, kind);
  if (text.length > MAX_EXTRACTED_TEXT_LENGTH) {
    throw new HttpError(422, "text_too_long", "The file contains too much text.");
  }
  const result = await analyze(text);
  // Analyses run from the Angular screens go into the same history as the Mantine ones.
  await saveToHistory(request, { sourceKind: kind, inputText: text, result, title: file.name.slice(0, 120) || undefined });
  return Response.json(toLegacyText(result));
});
