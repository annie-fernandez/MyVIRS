import { MAX_EXTRACTED_TEXT_LENGTH, type AnalyzableFileKind } from "@repo/core";
import { analyze } from "@/lib/analysis/analyze";
import { extractTextFromFile } from "@/lib/analysis/extract";
import { badRequest, HttpError, route } from "@/lib/api/http";
import { toLegacyText } from "@/lib/legacy/format";

export const maxDuration = 60;

const KINDS: Record<string, AnalyzableFileKind> = { PDF: "pdf", DOC: "document", IMG: "image" };

/** Legacy UI: POST /api/analyzeFile?type=PDF|DOC|IMG with a multipart `file`. */
export const POST = route(async (request) => {
  const kind = KINDS[request.nextUrl.searchParams.get("type") ?? ""];
  if (!kind) throw badRequest("type must be PDF, DOC or IMG.");

  const form = await request.formData().catch(() => {
    throw badRequest("Expected multipart/form-data.");
  });
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("A file is required.");

  const text = await extractTextFromFile(file, kind);
  if (text.length > MAX_EXTRACTED_TEXT_LENGTH) {
    throw new HttpError(422, "text_too_long", "The file contains too much text.");
  }
  return Response.json(toLegacyText(await analyze(text)));
});
