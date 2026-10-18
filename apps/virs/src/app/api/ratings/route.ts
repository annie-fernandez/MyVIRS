import { rateWordInput, type RatingEvent } from "@repo/core";
import { getDb } from "@repo/db";
import { recordRating } from "@repo/db/queries/ratings";
import { requireSession } from "@/lib/api/guards";
import { parseJson, route } from "@/lib/api/http";

/** POST /api/ratings { word, rating, analysisId?, context? } — records how well the signed-in user knows a word. */
export const POST = route(async (request) => {
  const { user } = await requireSession(request);
  const input = await parseJson(request, rateWordInput);
  const row = await recordRating(getDb(), { userId: user.id, ...input });
  const saved: RatingEvent = { word: row.word, rating: row.rating, createdAt: row.createdAt.toISOString(), context: row.context };
  return Response.json(saved, { status: 201 });
});
