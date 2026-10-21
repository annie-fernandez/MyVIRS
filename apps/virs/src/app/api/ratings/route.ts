import { rateWordInput, type RatingEvent } from "@repo/core";
import { getDb } from "@repo/db";
import { recordRating } from "@repo/db/queries/ratings";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseJson } from "@/app/api/_lib/http/parse-json";

/** POST /api/ratings { word, rating, analysisId?, context? } — records how well the signed-in user knows a word. */
export const POST = apiRoute(async (request) => {
  const { user } = await requireSession(request);
  const input = await parseJson(request, rateWordInput);
  const row = await recordRating(getDb(), { userId: user.id, ...input });
  const saved: RatingEvent = { word: row.word, rating: row.rating, createdAt: row.createdAt.toISOString(), context: row.context };
  return Response.json(saved, { status: 201 });
});
