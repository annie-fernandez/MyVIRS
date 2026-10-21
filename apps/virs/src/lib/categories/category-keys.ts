import { WORD_CATEGORIES } from "@repo/core";
import type { CategoryKey } from "@/theme/category-styles";

/** Every category in display order, with names and off-list words last. */
export const CATEGORY_KEYS: CategoryKey[] = [...WORD_CATEGORIES, "offList"];
