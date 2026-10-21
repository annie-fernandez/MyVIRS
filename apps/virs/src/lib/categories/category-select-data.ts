import { CATEGORY_INFO, WORD_CATEGORIES } from "@repo/core";

/** The word lists as Select options. */
export const CATEGORY_SELECT_DATA = WORD_CATEGORIES.map((category) => ({ value: category, label: CATEGORY_INFO[category].label }));
