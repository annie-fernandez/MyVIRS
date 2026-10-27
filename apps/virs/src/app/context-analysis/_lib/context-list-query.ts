import type { ContextListPage } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** One page of a ranked list. `params` is the GET /api/context-lists/:id query string (order, search, page). */
export const contextListQuery = (id: string, params: string) =>
  queryOptions({
    queryKey: queryKeys.contextList(id, params),
    queryFn: () => apiFetch<ContextListPage>(`/api/context-lists/${encodeURIComponent(id)}?${params}`),
    staleTime: Infinity,
  });
