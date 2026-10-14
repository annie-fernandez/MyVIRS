import type { AnalysisResult, AnalysisSourceKind } from "@repo/core";
import { getDb } from "@repo/db";
import { deleteUserAnalysis, getUserAnalysis } from "@repo/db/queries/history";
import { z } from "zod";
import { requireSession } from "@/lib/api/guards";
import { notFound, route } from "@/lib/api/http";

/** One saved analysis as the results screens need it. */
export interface SavedAnalysis {
  id: string;
  createdAt: string;
  sourceKind: AnalysisSourceKind;
  title: string | null;
  result: AnalysisResult;
}

const idSchema = z.uuid();

// Someone else's analysis, a deleted one and a malformed id all read as "not found", so the
// response never confirms that a row exists.
const missing = () => notFound("This analysis isn't in your history.");

/** GET /api/history/:id — a saved analysis exactly as it was computed at the time. */
export const GET = route(async (request, context: RouteContext<"/api/history/[id]">) => {
  const { user } = await requireSession(request);
  const id = idSchema.safeParse((await context.params).id);
  const row = id.success ? await getUserAnalysis(getDb(), user.id, id.data) : undefined;
  if (!row) throw missing();
  const saved: SavedAnalysis = {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    sourceKind: row.sourceKind,
    title: row.title,
    result: {
      words: row.wordMatches,
      sentenceCount: row.sentenceCount,
      fleschReadingScore: row.fleschReadingScore,
      statistics: row.statistics,
    },
  };
  return Response.json(saved, { headers: { "Cache-Control": "no-store" } });
});

/** DELETE /api/history/:id — removes one saved analysis. */
export const DELETE = route(async (request, context: RouteContext<"/api/history/[id]">) => {
  const { user } = await requireSession(request);
  const id = idSchema.safeParse((await context.params).id);
  if (!id.success || !(await deleteUserAnalysis(getDb(), user.id, id.data))) throw missing();
  return new Response(null, { status: 204 });
});
