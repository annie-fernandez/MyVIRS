import type { RatingFilter } from "../../_lib/rating-filter";
import { FILTER_OPTIONS } from "./filter-options";

/** The filter button's label: "All", or the chosen option's wording. */
export function filterLabel(filter: RatingFilter): string {
  return filter === "all" ? "All" : FILTER_OPTIONS.find((option) => option.value === filter)!.label;
}
