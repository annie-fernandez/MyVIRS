import { CATEGORY_INFO, normalizeWord, parseWordCategory } from "@repo/core";
import { getDb } from "@repo/db";
import { findWordsByValue } from "@repo/db/queries/words";
import { notFound, route } from "@/lib/api/http";
import { toLegacyWord } from "@/lib/legacy/format";

/** Legacy UI: GET /api/words/:value/:categories → the first matching word (by list priority). */
export const GET = route(async (_request, context: RouteContext<"/api/words/[value]/[categories]">) => {
  const { value, categories } = await context.params;
  const allowed = new Set(categories.split(",").map(parseWordCategory));
  const [match] = (await findWordsByValue(getDb(), normalizeWord(value)))
    .filter((word) => allowed.has(word.category))
    .sort((a, b) => CATEGORY_INFO[a.category].priority - CATEGORY_INFO[b.category].priority);

  if (!match) throw notFound("Word not found.");
  return Response.json(toLegacyWord(match));
});
