import type { Paginated, Word } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** One page of a word list. `params` is the GET /api/words query string (list, grade, sort, page, search). */
export const wordListQuery = (params: string) =>
  queryOptions({
    queryKey: queryKeys.wordList(params),
    queryFn: () => apiFetch<Paginated<Word>>(`/api/words?${params}`),
  });
