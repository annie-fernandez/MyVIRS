import "server-only";
import type { AnalysisResult, AnalysisSourceKind } from "@repo/core";
import { getDb } from "@repo/db";
import { recordAnalysis } from "@repo/db/queries/history";
import { getAuth } from "../auth";

/** What the analyze routes return: the result, plus the id it was saved under for a signed-in user. */
export type AnalyzeResponse = AnalysisResult & { historyId: string | null };

/**
 * Saves an analysis to the signed-in user's history and returns its id. Signed-out analyses are
 * not stored at all. A failed save never fails the analysis: the user still gets their result.
 */
export async function saveToHistory(
  request: Request,
  analysis: { sourceKind: AnalysisSourceKind; inputText: string; result: AnalysisResult; title?: string },
): Promise<string | null> {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return null;
    return await recordAnalysis(getDb(), { userId: session.user.id, ...analysis });
  } catch (error) {
    console.error("[history] could not save analysis", error);
    return null;
  }
}
