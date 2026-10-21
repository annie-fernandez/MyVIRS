import type { WordCategory } from "@repo/core";

/** The old database stored K-lists in upper case ("K1") and the rest in lower case ("awl"). */
export function toLegacyCategory(category: WordCategory | null): string {
  if (!category) return "";
  return category.startsWith("k") ? category.toUpperCase() : category;
}
