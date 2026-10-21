import { CATEGORY_INFO, OFF_LIST_INFO } from "@repo/core";
import type { CategoryKey } from "@/theme/category-styles";

/** One sentence on what a category's words are. */
export function categoryDescription(category: CategoryKey): string {
  return category === "offList" ? OFF_LIST_INFO.description : CATEGORY_INFO[category].description;
}
