import { normalizeWord } from "@repo/core";
import { getDb } from "@repo/db";
import { findWordsByValue } from "@repo/db/queries/words";
import { notFound, route } from "@/lib/api/http";

/** GET /api/words/:value — every word-list entry (category + grade) for a word. */
export const GET = route(async (_request, context: RouteContext<"/api/words/[value]">) => {
  const { value } = await context.params;
  const normalized = normalizeWord(value);
  const entries = normalized ? await findWordsByValue(getDb(), normalized) : [];
  if (entries.length === 0) throw notFound(`"${value}" is not in any word list.`);
  return Response.json(entries);
});
