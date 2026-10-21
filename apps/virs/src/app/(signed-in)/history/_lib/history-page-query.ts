import type { HistoryItem, Paginated } from "@repo/core";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { queryKeys } from "@/lib/query-keys";

const PAGE_SIZE = 10;

/** One page of the signed-in user's saved analyses, newest first. */
export const historyPageQuery = (page: number) =>
  queryOptions({
    queryKey: queryKeys.historyPage(page),
    queryFn: () => apiFetch<Paginated<HistoryItem>>(`/api/history?page=${page}&pageSize=${PAGE_SIZE}`),
  });
