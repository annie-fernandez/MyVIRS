import type { PassageRankedWord } from "@repo/core";

export interface ComparedWord extends PassageRankedWord {
  /** Place among the passage's own words in each ranking. 1 = teach first. */
  contextPlace: number;
  frequencyPlace: number;
}

/** The passage's words, still in context order, with their place in each ranking counted among the passage's words only. */
export function compareRanks(words: PassageRankedWord[]): ComparedWord[] {
  const byFrequency = [...words].sort((a, b) => a.frequencyRank - b.frequencyRank);
  const frequencyPlace = new Map(byFrequency.map((word, index) => [word.headword, index + 1]));
  return words.map((word, index) => ({ ...word, contextPlace: index + 1, frequencyPlace: frequencyPlace.get(word.headword)! }));
}
