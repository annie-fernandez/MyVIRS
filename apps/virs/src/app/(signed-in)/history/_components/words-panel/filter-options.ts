import { KNOWN_RATING } from "@repo/core";
import { RATING_SCALE } from "@/theme/rating-scale";
import type { RatingFilter } from "../../_lib/rating-filter";

/** The choices in the "Rating" filter menu. */
export const FILTER_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: "all", label: "All ratings" },
  ...RATING_SCALE.map((step) => ({ value: String(step.value) as RatingFilter, label: `${step.value} – ${step.label}` })),
  { value: "known", label: `${KNOWN_RATING} or 5 – words you know` },
];
