import type { RatingValue } from "@repo/core";

/** One rating ("1"–"5"), the words you know ("known", rated 4 or 5), or everything. */
export type RatingFilter = "all" | "known" | `${RatingValue}`;
