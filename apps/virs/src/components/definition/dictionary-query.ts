import type { DictionaryEntry } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** A word's Wiktionary definition. Definitions don't change during a visit, so each word is fetched once. */
export const dictionaryQuery = (word: string) =>
  queryOptions({
    queryKey: queryKeys.dictionary(word),
    queryFn: () => apiFetch<DictionaryEntry>(`/api/dictionary/${encodeURIComponent(word)}`),
    staleTime: Infinity,
    gcTime: Infinity,
  });
