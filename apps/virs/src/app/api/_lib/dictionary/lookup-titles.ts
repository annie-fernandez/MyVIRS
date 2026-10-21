import { removePunctuation, singularize } from "@repo/core";

/** The Wiktionary titles to try for a word, in order. Lowercase first: a capitalized token is usually just the start of a sentence. */
export function lookupTitles(word: string): string[] {
  const asWritten = removePunctuation(word);
  const lower = asWritten.toLowerCase();
  return [...new Set([lower, singularize(lower), asWritten].filter(Boolean))];
}
