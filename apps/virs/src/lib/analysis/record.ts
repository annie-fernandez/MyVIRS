import "server-only";
import type { AnalysisResult, AnalysisSourceKind } from "@repo/core";
import { getDb } from "@repo/db";
import { recordAnalysis } from "@repo/db/queries/history";
import { getAuth } from "@/lib/auth";

/** Persists a finished analysis for the signed-in user. Guests are not stored. */
export async function saveSignedInAnalysis(
  request: Request,
  input: { sourceKind: AnalysisSourceKind; inputText: string; result: AnalysisResult },
): Promise<void> {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return;
  await recordAnalysis(getDb(), {
    userId: session.user.id,
    sourceKind: input.sourceKind,
    inputText: input.inputText,
    result: input.result,
  });
}
