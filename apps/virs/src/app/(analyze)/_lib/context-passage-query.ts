import type { ContextPassageInput, ContextPassageMatch } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** An analysis's words looked up in one of Team A's ranked lists. `analyzedAt` tells analyses apart; `counts` come from it. */
export const contextPassageQuery = (id: string, analyzedAt: string, counts: ContextPassageInput["counts"]) =>
  queryOptions({
    queryKey: queryKeys.contextPassage(id, analyzedAt),
    queryFn: () => apiFetch<ContextPassageMatch>(`/api/context-lists/${encodeURIComponent(id)}/passage`, { method: "POST", json: { counts } }),
    staleTime: Infinity,
  });
