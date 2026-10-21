import type { Word } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

/** Every list entry for one word, with ids, for editing. */
export const adminWordQuery = (value: string) =>
  queryOptions({
    queryKey: queryKeys.adminWord(value),
    queryFn: () => apiFetch<Word[]>(`/api/admin/words?value=${encodeURIComponent(value)}`),
  });
