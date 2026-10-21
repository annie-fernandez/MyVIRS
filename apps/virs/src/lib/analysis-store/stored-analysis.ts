import type { AnalysisResult } from "@repo/core";

/** The latest analysis in this tab, kept so the results screens survive a reload. */
export interface StoredAnalysis {
  result: AnalysisResult;
  /** Where the text came from, e.g. "Pasted text" or a file name. */
  source: string;
  analyzedAt: string;
  /** Set when the analysis is in the signed-in user's history; absent or null when it wasn't saved. */
  historyId?: string | null;
}
