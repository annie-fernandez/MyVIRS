import type { RatingEvent } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** Every rating the signed-in user has given a word, newest first. */
export const wordRatingsQuery = (word: string) =>
  queryOptions({
    queryKey: queryKeys.wordRatings(word),
    queryFn: () => apiFetch<RatingEvent[]>(`/api/ratings/${encodeURIComponent(word)}`),
  });
