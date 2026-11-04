import pluralize from "pluralize";

const NON_LETTER_OR_DIGIT = /[^\p{L}\p{N}]/gu;
const MIN_PLURAL_LENGTH = 4;
const SINGLE_SYLLABLE_EXCEPTIONS = new Set(["he", "she", "me", "pe", "fe", "be", "the", "we"]);
const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);
const NUMBER_UNITS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];
const ORDINAL_UNITS = [
  "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
];
const NUMBER_TENS = [
  "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];
const NUMBER_WORDS = new Set([
  "zero", ...NUMBER_UNITS,
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen", ...NUMBER_TENS,
  "hundred", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion",
  "zeroth", ...ORDINAL_UNITS,
  "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth",
  "seventeenth", "eighteenth", "nineteenth",
  "twentieth", "thirtieth", "fortieth", "fiftieth", "sixtieth", "seventieth",
  "eightieth", "ninetieth", "hundredth", "thousandth", "millionth", "billionth",
  "trillionth", "quadrillionth", "quintillionth",
]);
const COMPOUND_NUMBER = new RegExp(
  `^(?:${NUMBER_TENS.join("|")})[-\u2010\u2011](?:${[...NUMBER_UNITS, ...ORDINAL_UNITS].join("|")})$`,
);

/** Recognizes number words without turning unrelated hyphenated words into numbers. */
export function isSpelledOutNumber(token: string): boolean {
  const word = token.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  return NUMBER_WORDS.has(word) || COMPOUND_NUMBER.test(word);
}

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
