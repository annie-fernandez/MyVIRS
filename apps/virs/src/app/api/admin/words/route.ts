import { adminWordInput, normalizeWord, wordCategorySchema } from "@repo/core";
import { getDb } from "@repo/db";
import { deleteWordsByCategory, findWordsByValue, upsertWord } from "@repo/db/queries/words";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/guards";
import { parseJson, parseSearchParams, route } from "@/lib/api/http";

/** GET /api/admin/words?value=word — all entries for a word, including ids. */
export const GET = route(async (request) => {
  await requireAdmin(request);
  const { value } = parseSearchParams(request, z.object({ value: z.string().min(1).max(256) }));
  return Response.json(await findWordsByValue(getDb(), normalizeWord(value)));
});

/** POST /api/admin/words — add a word to a category (updates the grade if it already exists). */
export const POST = route(async (request) => {
  await requireAdmin(request);
  const input = await parseJson(request, adminWordInput);
  return Response.json(await upsertWord(getDb(), input), { status: 201 });
});

/** DELETE /api/admin/words?category=awl — remove every word in a category. */
export const DELETE = route(async (request) => {
  await requireAdmin(request);
  const { category } = parseSearchParams(request, z.object({ category: wordCategorySchema }));
  const deleted = await deleteWordsByCategory(getDb(), category);
  return Response.json({ deleted });
});
