import type { AnalysisResult } from "@repo/core";
import { toLegacyCategory } from "./to-legacy-category";

/** The old analysis JSON: the words with their categories, and counts under the old names. */
export function toLegacyText(result: AnalysisResult) {
  const { wordCount, wordPercentage } = result.statistics;
  const breakdown = (source: typeof wordPercentage, total: number) => ({
    stem: source.stem,
    awl: source.awl,
    hi: source.hi,
    med: source.med,
    low: source.low,
    noCategory: source.offList,
    k1: source.k1,
    k2: source.k2,
    k3: source.k3,
    total,
  });

  return {
    words: result.words.map((word) => ({
      value: word.value ?? "",
      category: toLegacyCategory(word.category),
      initialValue: word.initialValue,
    })),
    fleschReadingScore: result.fleschReadingScore,
    sentenceCount: result.sentenceCount,
    statistics: {
      wordCount: breakdown(wordCount, wordCount.total),
      wordPercentage: breakdown(wordPercentage, wordCount.total === 0 ? 0 : 1),
    },
  };
}
