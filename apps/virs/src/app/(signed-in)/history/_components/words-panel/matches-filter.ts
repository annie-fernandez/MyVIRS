import { KNOWN_RATING, type WordProgress } from "@repo/core";
import type { RatingFilter } from "../../_lib/rating-filter";

/** Whether a word passes the rating filter. */
export function matchesFilter(word: WordProgress, filter: RatingFilter): boolean {
  if (filter === "all") return true;
  if (filter === "known") return word.rating >= KNOWN_RATING;
  return String(word.rating) === filter;
}
