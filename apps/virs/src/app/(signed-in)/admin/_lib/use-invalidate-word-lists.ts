"use client";

import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

/** After a change to the word lists, refetches every word query: the admin lookup and Search the word lists. */
export function useInvalidateWordLists() {
  const queryClient = useQueryClient();
  return () => Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.adminWords }), queryClient.invalidateQueries({ queryKey: queryKeys.words })]);
}
