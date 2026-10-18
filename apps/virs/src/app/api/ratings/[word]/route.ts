import { normalizeWord, type RatingEvent } from "@repo/core";
import { getDb } from "@repo/db";
import { listWordRatings } from "@repo/db/queries/ratings";
import { requireSession } from "@/lib/api/guards";
import { route } from "@/lib/api/http";

/** GET /api/ratings/:word — every rating the signed-in user has given this word, newest first. */
export const GET = route(async (request, context: RouteContext<"/api/ratings/[word]">) => {
  const { user } = await requireSession(request);
  const word = normalizeWord(decodeURIComponent((await context.params).word));
  const rows = word ? await listWordRatings(getDb(), user.id, word) : [];
  const history: RatingEvent[] = rows.map((row) => ({ word: row.word, rating: row.rating, createdAt: row.createdAt.toISOString(), context: row.context }));
  return Response.json(history, { headers: { "Cache-Control": "no-store" } });
});
