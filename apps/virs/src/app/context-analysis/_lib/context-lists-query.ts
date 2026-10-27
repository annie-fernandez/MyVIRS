import type { ContextListSummary } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** Team A's ranked lists to choose from. They only change with a deploy. */
export const contextListsQuery = () =>
  queryOptions({
    queryKey: queryKeys.contextLists,
    queryFn: () => apiFetch<ContextListSummary[]>("/api/context-lists"),
    staleTime: Infinity,
  });
