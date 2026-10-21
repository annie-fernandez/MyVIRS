import { normalizeWord } from "@repo/core";
import { getDb } from "@repo/db";
import { findWordsByValue } from "@repo/db/queries/words";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { HttpError } from "@/app/api/_lib/http/http-error";

/** GET /api/words/:value — every word-list entry (category + grade) for a word. */
export const GET = apiRoute(async (_request, context: RouteContext<"/api/words/[value]">) => {
  const { value } = await context.params;
  const normalized = normalizeWord(value);
  const entries = normalized ? await findWordsByValue(getDb(), normalized) : [];
  if (entries.length === 0) throw HttpError.notFound(`"${value}" is not in any word list.`);
  return Response.json(entries);
});
