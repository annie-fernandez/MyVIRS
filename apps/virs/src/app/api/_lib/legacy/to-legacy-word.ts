import type { Word } from "@repo/core";
import { toLegacyCategory } from "./to-legacy-category";

/** The old `Word` JSON. */
export function toLegacyWord(word: Word) {
  return { id: word.id, value: word.value, category: toLegacyCategory(word.category), grade: word.grade };
}
