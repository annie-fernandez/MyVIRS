import { summarizeWords, type ProgressData } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** The signed-in user's ratings and analysis scores, plus each rated word's summary. */
export const progressQuery = queryOptions({
  queryKey: queryKeys.progress,
  queryFn: () => apiFetch<ProgressData>("/api/progress"),
  // Runs only when the ratings change, not on every render.
  select: (data) => ({ ...data, words: summarizeWords(data.ratings) }),
});
