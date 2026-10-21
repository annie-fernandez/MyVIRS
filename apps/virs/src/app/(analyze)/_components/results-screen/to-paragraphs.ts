import type { WordMatch } from "@repo/core";

/** Splits the flat token list on paragraph markers, keeping each token's position. */
export function toParagraphs(words: WordMatch[]): { word: WordMatch; index: number }[][] {
  const paragraphs: { word: WordMatch; index: number }[][] = [[]];
  words.forEach((word, index) => {
    if (word.initialValue === "") paragraphs.push([]);
    else paragraphs[paragraphs.length - 1]!.push({ word, index });
  });
  return paragraphs.filter((paragraph) => paragraph.length > 0);
}
