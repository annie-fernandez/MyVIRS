import type { ContextListSummary } from "@repo/core";
import { apiRoute } from "@/app/api/_lib/http/api-route";
import { CONTEXT_LISTS } from "./_lib/context-lists";
import { loadContextList } from "./_lib/load-context-list";

/** GET /api/context-lists — Team A's ranked word lists, for the Analysis by context screen. */
export const GET = apiRoute(async () => {
  const lists: ContextListSummary[] = await Promise.all(Object.keys(CONTEXT_LISTS).map(async (id) => (await loadContextList(id))!.list));
  return Response.json(lists);
});
