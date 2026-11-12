/** A clicked word without the punctuation around it, or null when there's nothing to translate, like "—" or "42". */
export function translatableWord(word: string): string | null {
  const cleaned = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  return /\p{L}/u.test(cleaned) ? cleaned : null;
}
