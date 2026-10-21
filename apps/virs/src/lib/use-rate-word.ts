"use client";

import { normalizeWord, type ProgressData, type RateWordInput, type RatingEvent } from "@repo/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api-client/api-fetch";
import { queryKeys } from "./query-keys";

/**
 * Saves how well the signed-in user knows a word. The rating shows at once wherever the word's
 * ratings are on screen (History and the definition pop-up), and is taken back out if the save fails.
 */
export function useRateWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RateWordInput) => apiFetch<RatingEvent>("/api/ratings", { method: "POST", json: input }),
    onMutate: async (input) => {
      const ratingsKey = queryKeys.wordRatings(input.word);
      await Promise.all([queryClient.cancelQueries({ queryKey: queryKeys.progress }), queryClient.cancelQueries({ queryKey: ratingsKey })]);
      const previous = {
        progress: queryClient.getQueryData<ProgressData>(queryKeys.progress),
        ratings: queryClient.getQueryData<RatingEvent[]>(ratingsKey),
      };
      // Normalized the way the server stores it, so History lists it under the same word.
      const pending: RatingEvent = { word: normalizeWord(input.word.trim()), rating: input.rating, context: input.context ?? null, createdAt: new Date().toISOString() };
      queryClient.setQueryData<ProgressData>(queryKeys.progress, (data) => data && { ...data, ratings: [...data.ratings, pending] });
      // Newest first, as GET /api/ratings/:word returns them.
      queryClient.setQueryData<RatingEvent[]>(ratingsKey, (rows) => rows && [pending, ...rows]);
      return previous;
    },
    onError: (_error, input, previous) => {
      queryClient.setQueryData(queryKeys.progress, previous?.progress);
      queryClient.setQueryData(queryKeys.wordRatings(input.word), previous?.ratings);
    },
  });
}
