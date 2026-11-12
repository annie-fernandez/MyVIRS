import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { translateInBrowser } from "./translate-in-browser";

/** A translation, asked for once per text and language during a visit. No retries: a "busy" answer from Google gets worse with more requests. */
export const translationQuery = (text: string, target: string) =>
  queryOptions({
    queryKey: queryKeys.translation(text, target),
    queryFn: () => translateInBrowser(text, target),
    staleTime: Infinity,
    retry: false,
  });
