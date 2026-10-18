import type { RatingEvent } from "@repo/core";
import { getDb } from "@repo/db";
import { getUserProgress } from "@repo/db/queries/ratings";
import { requireSession } from "@/lib/api/guards";
import { route } from "@/lib/api/http";

/** The data behind the progress charts. The browser groups it by day, in the viewer's time zone. */
export interface ProgressData {
  ratings: RatingEvent[];
  analyses: { createdAt: string; fleschReadingScore: number; wordCount: number }[];
}

/** GET /api/progress — every word rating and every saved analysis's score for the signed-in user, oldest first. */
export const GET = route(async (request) => {
  const { user } = await requireSession(request);
  const { ratings, analyses } = await getUserProgress(getDb(), user.id);
  const data: ProgressData = {
    ratings: ratings.map((row) => ({ word: row.word, rating: row.rating, createdAt: row.createdAt.toISOString(), context: row.context })),
    analyses: analyses.map((row) => ({ createdAt: row.createdAt.toISOString(), fleschReadingScore: row.fleschReadingScore, wordCount: row.wordCount })),
  };
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
});
