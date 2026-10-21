import type { Word } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** Every list a word appears in. Only a hint next to the results, so any failure reads as "in no list". */
export const wordLookupQuery = (value: string) =>
  queryOptions({
    queryKey: queryKeys.wordLookup(value),
    queryFn: () => apiFetch<Word[]>(`/api/words/${encodeURIComponent(value)}`).catch(() => []),
  });
