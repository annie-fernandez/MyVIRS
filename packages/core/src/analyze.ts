import { CATEGORY_INFO, WORD_CATEGORIES, type WordCategory } from "./categories";
import { countSyllables, lookupCandidates } from "./word";

export interface WordMatch {
  /** The token exactly as it appeared in the text. An empty string marks a line break. */
  initialValue: string;
  /** The word-list entry the token matched, or null for names and off-list words. */
  value: string | null;
  category: WordCategory | null;
}

export type CategoryBreakdown = Record<WordCategory | "offList", number>;

export interface TextStatistics {
  wordCount: CategoryBreakdown & { total: number };
  /** Fractions in the range 0..1. */
  wordPercentage: CategoryBreakdown;
}

export interface AnalysisResult {
  words: WordMatch[];
  sentenceCount: number;
  fleschReadingScore: number;
  statistics: TextStatistics;
}

export interface WordListEntry {
  value: string;
  category: WordCategory;
}

export type WordLookup = (values: string[]) => Promise<WordListEntry[]>;

const TOKEN_SEPARATOR = /[\n\r\s]/;
const SENTENCE_BOUNDARY = /[a-zA-Z\s][.?!]{1,3}\s/;
const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
const LOOKUP_BATCH_SIZE = 1000;
const MIN_WORDS_FOR_READABILITY = 100;

export function tokenize(text: string): string[] {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(TOKEN_SEPARATOR) : [];
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(SENTENCE_BOUNDARY);
  while (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts.length;
}

export function isCountableWord(token: string): boolean {
  const value = token.trim();
  return value.length > 1 || (value.length === 1 && LETTER_OR_DIGIT.test(value));
}

/** https://readabilityformulas.com/flesch-reading-ease-readability-formula.php */
export function fleschReadingEase(
  wordCount: number,
  sentenceCount: number,
  syllableCount: number,
): number {
  if (wordCount < MIN_WORDS_FOR_READABILITY || sentenceCount === 0) return 0;
  const averageSentenceLength = wordCount / sentenceCount;
  const averageSyllablesPerWord = syllableCount / wordCount;
  const score = 206.835 - 1.015 * averageSentenceLength - 84.6 * averageSyllablesPerWord;
  return Math.min(100, Math.max(0, score));
}

function emptyBreakdown(): CategoryBreakdown {
  const breakdown = { offList: 0 } as CategoryBreakdown;
  for (const category of WORD_CATEGORIES) breakdown[category] = 0;
  return breakdown;
}

export function computeStatistics(words: WordMatch[]): TextStatistics {
  const counts = emptyBreakdown();
  for (const word of words) {
    if (!lookupCandidates(word.initialValue).length) continue;
    counts[word.category ?? "offList"]++;
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const percentages = emptyBreakdown();
  for (const key of Object.keys(counts) as (keyof CategoryBreakdown)[]) {
    percentages[key] = total === 0 ? 0 : counts[key] / total;
  }

  return { wordCount: { ...counts, total }, wordPercentage: percentages };
}

/** Picks, for every value, the entry whose category has the highest priority. */
function indexByPriority(entries: WordListEntry[]): Map<string, WordListEntry> {
  const index = new Map<string, WordListEntry>();
  for (const entry of entries) {
    const current = index.get(entry.value);
    if (!current || CATEGORY_INFO[entry.category].priority < CATEGORY_INFO[current.category].priority) {
      index.set(entry.value, entry);
    }
  }
  return index;
}

async function lookupAll(values: string[], lookup: WordLookup): Promise<WordListEntry[]> {
  const batches: Promise<WordListEntry[]>[] = [];
  for (let i = 0; i < values.length; i += LOOKUP_BATCH_SIZE) {
    batches.push(lookup(values.slice(i, i + LOOKUP_BATCH_SIZE)));
  }
  return (await Promise.all(batches)).flat();
}

export async function analyzeText(text: string, lookup: WordLookup): Promise<AnalysisResult> {
  const tokens = tokenize(text);
  const candidatesByToken = tokens.map(lookupCandidates);
  const distinctValues = [...new Set(candidatesByToken.flat())];
  const index = indexByPriority(await lookupAll(distinctValues, lookup));

  const words: WordMatch[] = tokens.map((token, i) => {
    const match = candidatesByToken[i]!.map((value) => index.get(value)).find(Boolean);
    return {
      initialValue: token,
      value: match?.value ?? null,
      category: match?.category ?? null,
    };
  });

  const countableTokens = tokens.filter(isCountableWord);
  const syllableCount = countableTokens.reduce((sum, token) => sum + countSyllables(token), 0);
  const sentenceCount = countSentences(text);

  return {
    words,
    sentenceCount,
    fleschReadingScore: fleschReadingEase(countableTokens.length, sentenceCount, syllableCount),
    statistics: computeStatistics(words),
  };
}
