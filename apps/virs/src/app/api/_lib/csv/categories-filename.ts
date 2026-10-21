import type { WordCategory } from "@repo/core";

/** The download's file name, e.g. virs-words-k1-awl.csv. */
export function categoriesFilename(categories: WordCategory[]): string {
  return `virs-words-${categories.join("-")}.csv`;
}
