import type { SavedAnalysis } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** One saved analysis with its full results, as it was computed at the time. */
export const savedAnalysisQuery = (id: string) =>
  queryOptions({
    queryKey: queryKeys.savedAnalysis(id),
    queryFn: () => apiFetch<SavedAnalysis>(`/api/history/${id}`),
    // A saved analysis never changes.
    staleTime: Infinity,
  });
