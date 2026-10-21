import type { WordMatch } from "@repo/core";
import type { CategoryKey } from "@/theme/category-styles";

/** A word's list, or "offList" when it's in none. */
export function categoryOf(word: WordMatch): CategoryKey {
  return word.category ?? "offList";
}
