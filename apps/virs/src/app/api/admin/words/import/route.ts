import { adminWordImportInput, normalizeWord, parseGrade, parseWordCategory } from "@repo/core";
import { getDb, type NewWordRow } from "@repo/db";
import { importWords } from "@repo/db/queries/words";
import { requireAdmin } from "@/lib/api/guards";
import { badRequest, HttpError, route } from "@/lib/api/http";
import { parseWordsCsv } from "@/lib/csv";

const MAX_CSV_BYTES = 5 * 1024 * 1024;
const MAX_REPORTED_ERRORS = 50;

/**
 * POST /api/admin/words/import (multipart): `file` (CSV), optional `category`, `replace` (true|false).
 * When `category` is set every row goes into it; otherwise each row needs a category column.
 * `replace` first deletes the words of that category, in the same transaction as the import.
 */
export const POST = route(async (request) => {
  await requireAdmin(request);

  const form = await request.formData().catch(() => {
    throw badRequest("Expected multipart/form-data.");
  });
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("A CSV file is required.");
  if (file.size > MAX_CSV_BYTES) throw new HttpError(413, "file_too_large", "CSV files can be at most 5 MB.");

  const { category, replace } = adminWordImportInput.parse({
    category: form.get("category") || undefined,
    replace: form.get("replace") || undefined,
  });
  if (replace && !category) throw badRequest("Choose the category to replace.");

  const records = parseWordsCsv(await file.text());
  const rows: NewWordRow[] = [];
  const errors: { line: number; message: string }[] = [];

  records.forEach((record, index) => {
    const value = normalizeWord(record.value);
    const rowCategory = category ?? parseWordCategory(record.category ?? "");
    if (!value || !rowCategory) {
      errors.push({ line: index + 1, message: !value ? "Missing word" : "Missing or unknown category" });
      return;
    }
    rows.push({ value, category: rowCategory, grade: parseGrade(record.grade ?? "") ?? null });
  });

  if (rows.length === 0) throw badRequest("The CSV does not contain any valid words.", errors.slice(0, MAX_REPORTED_ERRORS));

  const imported = await importWords(getDb(), rows, { replace, category });
  return Response.json({
    imported,
    skipped: errors.length,
    errors: errors.slice(0, MAX_REPORTED_ERRORS),
  });
});
