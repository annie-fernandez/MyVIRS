import type { RatingValue } from "@repo/core";
import { RATING_SCALE } from "@/theme/rating-scale";

/** What a rating means, in words: 4 → "I know what it means". */
export function ratingLabel(value: RatingValue): string {
  return RATING_SCALE.find((step) => step.value === value)!.label;
}
