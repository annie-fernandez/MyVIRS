import type { RankedWord } from "@repo/core";

// Team A's band scores (priority_ranking.py, BAND_SCORES). With no text grade, their frequency-only
// ranking is just this score, ties broken by count and then the headword.
const BAND_SCORES: Record<RankedWord["band"], number> = { HIGH: 1, MID: 0.6, LOW: 0.3, NONE: 0.1 };

/** Team A's frequency-only baseline: the same words re-ranked by band alone (their --frequency-only). */
export function orderByFrequency(words: RankedWord[]): RankedWord[] {
  return [...words]
    .sort((a, b) => BAND_SCORES[b.band] - BAND_SCORES[a.band] || (b.count ?? 0) - (a.count ?? 0) || a.headword.localeCompare(b.headword))
    .map((word, index) => ({ ...word, priority: BAND_SCORES[word.band], rank: index + 1 }));
}
