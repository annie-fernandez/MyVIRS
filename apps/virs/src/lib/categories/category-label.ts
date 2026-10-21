import { CATEGORY_INFO, OFF_LIST_INFO } from "@repo/core";
import type { CategoryKey } from "@/theme/category-styles";

/** A category's name, e.g. "K1" or "Names and off-list". */
export function categoryLabel(category: CategoryKey): string {
  return category === "offList" ? OFF_LIST_INFO.label : CATEGORY_INFO[category].label;
}
