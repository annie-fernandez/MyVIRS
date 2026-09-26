import type { AnalysisResult, AnalysisSourceKind, Paginated } from "@repo/core";
import { and, count, desc, eq } from "drizzle-orm";
import type { Database } from "../client";
import { analysis, type AnalysisRow } from "../schema";

/** Longest title generated from a passage's first line before it is truncated. */
const TITLE_MAX_LENGTH = 120;

export interface RecordAnalysisInput {
  /** Null records an analysis run while signed out; it simply has no owner. */
  userId: string | null;
  sourceKind: AnalysisSourceKind;
  inputText: string;
  result: AnalysisResult;
  title?: string;
}

/** A history row without the bulky snapshot columns, for list views. */
export interface AnalysisSummary {
  id: string;
  createdAt: Date;
  sourceKind: AnalysisSourceKind;
  title: string | null;
  sentenceCount: number;
  fleschReadingScore: number;
  wordCount: number;
}

/** Falls back to the first non-empty line of the passage so a row is never unlabelled. */
export function deriveTitle(inputText: string): string | null {
  const firstLine = inputText
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return null;
  return firstLine.length > TITLE_MAX_LENGTH ? `${firstLine.slice(0, TITLE_MAX_LENGTH - 1)}…` : firstLine;
}

export async function recordAnalysis(db: Database, input: RecordAnalysisInput): Promise<string> {
  const inserted = await db
    .insert(analysis)
    .values({
      userId: input.userId,
      sourceKind: input.sourceKind,
      title: input.title ?? deriveTitle(input.inputText),
      inputText: input.inputText,
      sentenceCount: input.result.sentenceCount,
      fleschReadingScore: input.result.fleschReadingScore,
      statistics: input.result.statistics,
      wordMatches: input.result.words,
    })
    .returning({ id: analysis.id });
  return inserted[0]!.id;
}

export async function listUserAnalyses(
  db: Database,
  userId: string,
  page = 1,
  pageSize = 20,
): Promise<Paginated<AnalysisSummary>> {
  const where = eq(analysis.userId, userId);
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: analysis.id,
        createdAt: analysis.createdAt,
        sourceKind: analysis.sourceKind,
        title: analysis.title,
        sentenceCount: analysis.sentenceCount,
        fleschReadingScore: analysis.fleschReadingScore,
        statistics: analysis.statistics,
      })
      .from(analysis)
      .where(where)
      .orderBy(desc(analysis.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(analysis).where(where),
  ]);

  const total = totals[0]?.total ?? 0;
  return {
    items: rows.map(({ statistics, ...row }) => ({ ...row, wordCount: statistics.wordCount.total })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Scoped by owner, so another user's id reads as absent rather than forbidden — the caller can
 * then return 404 without confirming the row exists.
 */
export async function getUserAnalysis(db: Database, userId: string, id: string): Promise<AnalysisRow | undefined> {
  const [row] = await db
    .select()
    .from(analysis)
    .where(and(eq(analysis.id, id), eq(analysis.userId, userId)))
    .limit(1);
  return row;
}

/** Returns false when the row does not exist or belongs to someone else. */
export async function deleteUserAnalysis(db: Database, userId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(analysis)
    .where(and(eq(analysis.id, id), eq(analysis.userId, userId)))
    .returning({ id: analysis.id });
  return deleted.length > 0;
}
