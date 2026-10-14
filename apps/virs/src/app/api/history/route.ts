import { historyListQuery } from "@repo/core";
import { getDb } from "@repo/db";
import { listUserAnalyses } from "@repo/db/queries/history";
import { requireSession } from "@/lib/api/guards";
import { parseSearchParams, route } from "@/lib/api/http";

/** GET /api/history — the signed-in user's saved analyses, newest first, without the full results. */
export const GET = route(async (request) => {
  const { user } = await requireSession(request);
  const { page, pageSize } = parseSearchParams(request, historyListQuery);
  return Response.json(await listUserAnalyses(getDb(), user.id, page, pageSize), { headers: { "Cache-Control": "no-store" } });
});
