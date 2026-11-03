import { lookupCandidates, normalizeWord, type ContextPassageInput, type ContextRanking, type PassageRankedWord, type RankedWord } from "@repo/core";
import { orderByFrequency } from "./order-by-frequency";

type IndexEntry = { word: RankedWord; frequencyRank: number };

// Built once per list (the rankings are cached for the server's lifetime by loadContextList).
const indexes = new WeakMap<ContextRanking, Map<string, IndexEntry>>();

/** Every form of every family, normalized the way the passage's words are. */
function indexOf(ranking: ContextRanking) {
  let index = indexes.get(ranking);
  if (!index) {
    const frequencyRanks = new Map(orderByFrequency(ranking.words).map((word) => [word.headword, word.rank]));
    index = new Map();
    // In context order, so when two families share a normalized form ("u.s." and "us") the higher-ranked one keeps it.
    for (const word of ranking.words) {
      const entry = { word, frequencyRank: frequencyRanks.get(word.headword)! };
      for (const form of [word.headword, ...word.forms]) {
        const key = normalizeWord(form);
        if (key && !index.has(key)) index.set(key, entry);
      }
    }
    indexes.set(ranking, index);
  }
  return index;
}

/** The passage's words found in a ranked list, grouped by family and in the list's context order. */
export function matchPassage(ranking: ContextRanking, counts: ContextPassageInput["counts"]) {
  const index = indexOf(ranking);
  const found = new Map<string, PassageRankedWord>();
  let unmatched = 0;

  for (const [token, count] of Object.entries(counts)) {
    // The word as written first, then its singular, as the word-list lookup does.
    const entry = lookupCandidates(token).map((candidate) => index.get(candidate)).find(Boolean);
    if (!entry) {
      unmatched++;
      continue;
    }
    const { word, frequencyRank } = entry;
    const match = found.get(word.headword) ?? { headword: word.headword, forms: [], count: 0, band: word.band, contextRank: word.rank, frequencyRank };
    match.forms.push(token);
    match.count += count;
    found.set(word.headword, match);
  }

  return { words: [...found.values()].sort((a, b) => a.contextRank - b.contextRank), unmatched };
}
