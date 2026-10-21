import type { ProgressData } from "@repo/core";
import { getDb } from "@repo/db";
import { getUserProgress } from "@repo/db/queries/ratings";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { apiRoute } from "@/app/api/_lib/http/api-route";

/** GET /api/progress — every word rating and every saved analysis's score for the signed-in user, oldest first. */
export const GET = apiRoute(async (request) => {
  const { user } = await requireSession(request);
  const { ratings, analyses } = await getUserProgress(getDb(), user.id);
  const data: ProgressData = {
    ratings: ratings.map((row) => ({ word: row.word, rating: row.rating, createdAt: row.createdAt.toISOString(), context: row.context })),
    analyses: analyses.map((row) => ({ createdAt: row.createdAt.toISOString(), fleschReadingScore: row.fleschReadingScore, wordCount: row.wordCount })),
  };
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
});
