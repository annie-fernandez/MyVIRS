import type { WordCategory } from "@repo/core";

/** The CSV download link for some lists. */
export function exportHref(categories: WordCategory[]) {
  return `/api/words/export?categories=${categories.join(",")}`;
}
