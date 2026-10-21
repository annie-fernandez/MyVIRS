import "server-only";
import { analyzeText, type AnalysisResult } from "@repo/core";
import { getDb } from "@repo/db";
import { lookupWords } from "@repo/db/queries/words";

export function analyze(text: string): Promise<AnalysisResult> {
  const db = getDb();
  return analyzeText(text, (values) => lookupWords(db, values));
}
