import { CATEGORY_INFO, OFF_LIST_INFO, WORD_CATEGORIES, type WordCategory } from "@repo/core";
import type { MantineColor } from "@mantine/core";

export type CategoryKey = WordCategory | "offList";

export const CATEGORY_COLORS: Record<CategoryKey, MantineColor> = {
  k1: "blue",
  k2: "green",
  k3: "red",
  awl: "yellow",
  baw: "orange",
  stem: "teal",
  hi: "lime",
  med: "grape",
  low: "pink",
  offList: "gray",
};

export const CATEGORY_KEYS: CategoryKey[] = [...WORD_CATEGORIES, "offList"];

export function categoryLabel(key: CategoryKey): string {
  return key === "offList" ? OFF_LIST_INFO.label : CATEGORY_INFO[key].label;
}

export function categoryDescription(key: CategoryKey): string {
  return key === "offList" ? OFF_LIST_INFO.description : CATEGORY_INFO[key].description;
}

/** Scheme-aware text color variable for a category (readable in light and dark mode). */
export function categoryTextColor(key: CategoryKey): string {
  return `var(--mantine-color-${CATEGORY_COLORS[key]}-text)`;
}

export const CATEGORY_SELECT_DATA = WORD_CATEGORIES.map((category) => ({
  value: category,
  label: CATEGORY_INFO[category].label,
}));
