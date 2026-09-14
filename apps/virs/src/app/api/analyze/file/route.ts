import { analyzableFileKindSchema, MAX_EXTRACTED_TEXT_LENGTH } from "@repo/core";
import { analyze } from "@/lib/analysis/analyze";
import { extractTextFromFile } from "@/lib/analysis/extract";
import { badRequest, HttpError, route } from "@/lib/api/http";

// Textract and large PDFs can take a while.
export const maxDuration = 60;

export const POST = route(async (request) => {
  const form = await request.formData().catch(() => {
    throw badRequest("Expected multipart/form-data.");
  });

  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("A file is required.");
  const kind = analyzableFileKindSchema.parse(form.get("kind"));

  const text = await extractTextFromFile(file, kind);
  if (text.length > MAX_EXTRACTED_TEXT_LENGTH) {
    throw new HttpError(
      422,
      "text_too_long",
      `The file contains more than ${MAX_EXTRACTED_TEXT_LENGTH.toLocaleString("en-US")} characters of text.`,
    );
  }

  return Response.json(await analyze(text));
});
