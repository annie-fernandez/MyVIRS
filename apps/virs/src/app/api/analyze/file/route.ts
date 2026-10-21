import { analyzableFileKindSchema, MAX_EXTRACTED_TEXT_LENGTH } from "@repo/core";
import { analyze } from "@/app/api/_lib/analysis/analyze";
import { extractTextFromFile } from "@/app/api/_lib/analysis/extract-text-from-file";
import { saveToHistory, type AnalyzeResponse } from "@/app/api/_lib/analysis/save-to-history";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";

// Large PDFs can take a while. Images never reach this route; the browser reads them.
export const maxDuration = 60;

export const POST = apiRoute(async (request) => {
  const form = await request.formData().catch(() => {
    throw HttpError.badRequest("Expected multipart/form-data.");
  });

  const file = form.get("file");
  if (!(file instanceof File)) throw HttpError.badRequest("A file is required.");
  const kind = analyzableFileKindSchema.parse(form.get("kind"));

  const text = await extractTextFromFile(file, kind);
  if (text.length > MAX_EXTRACTED_TEXT_LENGTH) {
    throw new HttpError(
      422,
      "text_too_long",
      `The file contains more than ${MAX_EXTRACTED_TEXT_LENGTH.toLocaleString("en-US")} characters of text.`,
    );
  }

  const result = await analyze(text);
  // The file's name is a better label in the history list than the first line of its text.
  const historyId = await saveToHistory(request, { sourceKind: kind, inputText: text, result, title: file.name.slice(0, 120) || undefined });
  return Response.json({ ...result, historyId } satisfies AnalyzeResponse);
});
