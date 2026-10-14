import { CATEGORY_INFO, GRADES, gradeLabel, OFF_LIST_INFO, WORD_CATEGORIES } from "@repo/core";
import type { CategoryKey } from "@/theme";

/** Every category in display order, with names and off-list words last. */
export const CATEGORY_KEYS: CategoryKey[] = [...WORD_CATEGORIES, "offList"];

export function categoryLabel(category: CategoryKey): string {
  return category === "offList" ? OFF_LIST_INFO.label : CATEGORY_INFO[category].label;
}

export function categoryDescription(category: CategoryKey): string {
  return category === "offList" ? OFF_LIST_INFO.description : CATEGORY_INFO[category].description;
}

export const CATEGORY_SELECT_DATA = WORD_CATEGORIES.map((category) => ({ value: category, label: CATEGORY_INFO[category].label }));

export const GRADE_SELECT_DATA = GRADES.map((grade) => ({ value: grade, label: gradeLabel(grade) }));
