import type { RatingValue } from "@repo/core";
import { and, asc, desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { analysis, wordRating } from "../schema";

/** Enough for years of daily use; the progress screen reads them all at once. */
const MAX_PROGRESS_ROWS = 20_000;

export interface RatingEventRow {
  word: string;
  rating: RatingValue;
  createdAt: Date;
  context: string | null;
}

const EVENT_COLUMNS = { word: wordRating.word, rating: wordRating.rating, createdAt: wordRating.createdAt, context: wordRating.context };

export async function recordRating(
  db: Database,
  input: { userId: string; word: string; rating: RatingValue; analysisId?: string | null; context?: string | null },
): Promise<RatingEventRow> {
  const [row] = await db
    .insert(wordRating)
    .values({ userId: input.userId, word: input.word, rating: input.rating, analysisId: input.analysisId ?? null, context: input.context ?? null })
    .returning(EVENT_COLUMNS);
  return row as RatingEventRow;
}

/** Every rating of one word by one user, newest first. */
export async function listWordRatings(db: Database, userId: string, word: string): Promise<RatingEventRow[]> {
  const rows = await db
    .select(EVENT_COLUMNS)
    .from(wordRating)
    .where(and(eq(wordRating.userId, userId), eq(wordRating.word, word)))
    .orderBy(desc(wordRating.createdAt));
  return rows as RatingEventRow[];
}

/** Everything the progress screen needs, oldest first: every rating and every saved analysis's score. */
export async function getUserProgress(db: Database, userId: string) {
  const [ratings, analyses] = await Promise.all([
    db
      .select(EVENT_COLUMNS)
      .from(wordRating)
      .where(eq(wordRating.userId, userId))
      .orderBy(asc(wordRating.createdAt))
      .limit(MAX_PROGRESS_ROWS),
    db
      .select({ createdAt: analysis.createdAt, fleschReadingScore: analysis.fleschReadingScore, statistics: analysis.statistics })
      .from(analysis)
      .where(eq(analysis.userId, userId))
      .orderBy(asc(analysis.createdAt))
      .limit(MAX_PROGRESS_ROWS),
  ]);
  return {
    ratings: ratings as RatingEventRow[],
    analyses: analyses.map(({ statistics, ...row }) => ({ ...row, wordCount: statistics.wordCount.total })),
  };
}
