import { historyListQuery, type HistoryItem, type Paginated } from "@repo/core";
import { getDb } from "@repo/db";
import { listUserAnalyses } from "@repo/db/queries/history";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { parseSearchParams } from "@/app/api/_lib/http/parse-search-params";

/** GET /api/history — the signed-in user's saved analyses, newest first, without the full results. */
export const GET = apiRoute(async (request) => {
  const { user } = await requireSession(request);
  const { page, pageSize } = parseSearchParams(request, historyListQuery);
  const list = await listUserAnalyses(getDb(), user.id, page, pageSize);
  const body: Paginated<HistoryItem> = { ...list, items: list.items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })) };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
});
