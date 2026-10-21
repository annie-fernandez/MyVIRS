import type { AnalysisResult } from "./analyze";
import type { RatingEvent } from "./progress";
import type { AnalysisSourceKind } from "./schemas";

// Response bodies of the VIRS API that the browser reads. The routes build them with these types,
// so the two sides can't drift apart.

/** One row of GET /api/history: a saved analysis without its full results. */
export interface HistoryItem {
  id: string;
  createdAt: string;
  sourceKind: AnalysisSourceKind;
  title: string | null;
  sentenceCount: number;
  fleschReadingScore: number;
  wordCount: number;
}

/** GET /api/history/:id — one saved analysis as the results screens need it. */
export interface SavedAnalysis {
  id: string;
  createdAt: string;
  sourceKind: AnalysisSourceKind;
  title: string | null;
  result: AnalysisResult;
}

/** GET /api/progress — the data behind the progress charts. The browser groups it by day, in the viewer's time zone. */
export interface ProgressData {
  ratings: RatingEvent[];
  analyses: { createdAt: string; fleschReadingScore: number; wordCount: number }[];
}
