import pluralize from "pluralize";

const NON_LETTER_OR_DIGIT = /[^\p{L}\p{N}]/gu;
const MIN_PLURAL_LENGTH = 4;
const SINGLE_SYLLABLE_EXCEPTIONS = new Set(["he", "she", "me", "pe", "fe", "be", "the", "we"]);
const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

export function removePunctuation(word: string): string {
  return word.replace(NON_LETTER_OR_DIGIT, "");
}

export function normalizeWord(word: string): string {
  return removePunctuation(word).toLowerCase();
}

export function singularize(word: string): string {
  return word.length > MIN_PLURAL_LENGTH ? pluralize.singular(word) : word;
}

/**
 * Database lookup keys for a raw token, most specific first: the token as written, then its
 * singular form. The legacy service only tried the singular, which missed list entries that
 * are themselves plural ("glasses", "means").
 */
export function lookupCandidates(token: string): string[] {
  const normalized = normalizeWord(token);
  if (!normalized) return [];
  const singular = singularize(normalized);
  return singular === normalized ? [normalized] : [normalized, singular];
}

export function countSyllables(word: string): number {
  const input = normalizeWord(word);
  if (SINGLE_SYLLABLE_EXCEPTIONS.has(input)) return 1;

  let i = input.length - 1;
  while (i >= 0 && input[i] === "e") i--;

  let syllables = 0;
  let previousWasVowel = false;
  for (; i >= 0; i--) {
    const isVowel = VOWELS.has(input[i]!);
    if (isVowel && !previousWasVowel) syllables++;
    previousWasVowel = isVowel;
  }
  return syllables;
}
