import { normalizeWord, type RatingEvent } from "@repo/core";
import { getDb } from "@repo/db";
import { listWordRatings } from "@repo/db/queries/ratings";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { apiRoute } from "@/app/api/_lib/http/api-route";

/** GET /api/ratings/:word — every rating the signed-in user has given this word, newest first. */
export const GET = apiRoute(async (request, context: RouteContext<"/api/ratings/[word]">) => {
  const { user } = await requireSession(request);
  const word = normalizeWord(decodeURIComponent((await context.params).word));
  const rows = word ? await listWordRatings(getDb(), user.id, word) : [];
  const history: RatingEvent[] = rows.map((row) => ({ word: row.word, rating: row.rating, createdAt: row.createdAt.toISOString(), context: row.context }));
  return Response.json(history, { headers: { "Cache-Control": "no-store" } });
});
