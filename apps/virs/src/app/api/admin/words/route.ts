import { adminWordInput, normalizeWord, wordCategorySchema } from "@repo/core";
import { getDb } from "@repo/db";
import { deleteWordsByCategory, findWordsByValue, updateWord, upsertWord } from "@repo/db/queries/words";
import { z } from "zod";
import { requireAdmin } from "@/app/api/_lib/auth/require-admin";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";
import { parseJson } from "@/app/api/_lib/http/parse-json";
import { parseSearchParams } from "@/app/api/_lib/http/parse-search-params";
import { toLegacyWord } from "@/app/api/_lib/legacy/to-legacy-word";
import { isUniqueViolation } from "@/app/api/admin/words/_lib/is-unique-violation";

/** GET /api/admin/words?value=word — all entries for a word, including ids. */
export const GET = apiRoute(async (request) => {
  await requireAdmin(request);
  const { value } = parseSearchParams(request, z.object({ value: z.string().min(1).max(256) }));
  return Response.json(await findWordsByValue(getDb(), normalizeWord(value)));
});

const wordWithOptionalId = z
  .object({ value: z.unknown() })
  .loose()
  // The legacy CSV upload posts whole CSV lines ("word,category") as the value.
  .transform((body) => ({ ...body, value: typeof body.value === "string" ? body.value.split(",")[0] : body.value }))
  .pipe(adminWordInput.extend({ id: z.coerce.number().int().positive().optional() }));

/**
 * POST /api/admin/words { value, category, grade?, id? }
 * Adds a word to a list (an omitted grade keeps the existing one). With `id` — as the legacy
 * admin page sends when editing — the existing entry is updated instead.
 */
export const POST = apiRoute(async (request) => {
  await requireAdmin(request);
  const { id, ...input } = await parseJson(request, wordWithOptionalId);
  const db = getDb();

  if (id === undefined) return Response.json(toLegacyWord(await upsertWord(db, input)), { status: 201 });

  const word = await updateWord(db, id, input).catch((error: unknown) => {
    if (isUniqueViolation(error)) {
      throw new HttpError(409, "conflict", `"${input.value}" already exists in ${input.category}.`);
    }
    throw error;
  });
  if (!word) throw HttpError.notFound("Word not found.");
  return Response.json(toLegacyWord(word));
});

/** DELETE /api/admin/words?category=awl — remove every word in a category. */
export const DELETE = apiRoute(async (request) => {
  await requireAdmin(request);
  const { category } = parseSearchParams(request, z.object({ category: wordCategorySchema }));
  const deleted = await deleteWordsByCategory(getDb(), category);
  return Response.json({ deleted });
});
