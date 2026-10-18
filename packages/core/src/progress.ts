import { z } from "zod";
import type { WordMatch } from "./analyze";
import { normalizeWord } from "./word";

/** The five self-ratings, stored as 1–5. 1 is "never seen it", 5 is "super confident". The numbers never change. */
export const RATING_VALUES = [1, 2, 3, 4, 5] as const;
export type RatingValue = (typeof RATING_VALUES)[number];

/** A word counts as known from this rating up ("I really know it"). */
export const KNOWN_RATING: RatingValue = 4;
/** Words rated this or lower are still being learned: "Never seen it" and "Slightly familiar". */
export const LEARNING_RATING: RatingValue = 2;

/** Longest sentence kept with a rating. */
export const MAX_CONTEXT_LENGTH = 300;

/** Where a word stands, in three plain groups students can act on. */
export type WordStage = "learning" | "almost" | "known";
export function wordStage(rating: RatingValue): WordStage {
  return rating <= LEARNING_RATING ? "learning" : rating < KNOWN_RATING ? "almost" : "known";
}

export const rateWordInput = z.object({
  word: z
    .string()
    .max(256)
    .transform((value) => normalizeWord(value.trim()))
    .refine((value) => value.length > 0, "Enter a word."),
  rating: z.union(RATING_VALUES.map((value) => z.literal(value)) as [z.ZodLiteral<1>, ...z.ZodLiteral<RatingValue>[]]),
  /** The saved analysis the word was rated from, when there is one. */
  analysisId: z.uuid().nullish(),
  /** The sentence the word was rated from. Over-long sentences are cut, not rejected. */
  context: z
    .string()
    .nullish()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed.slice(0, MAX_CONTEXT_LENGTH) : null;
    }),
});
export type RateWordInput = z.infer<typeof rateWordInput>;

export interface RatingEvent {
  word: string;
  rating: RatingValue;
  /** ISO timestamp. */
  createdAt: string;
  context?: string | null;
}

export interface WordProgress {
  word: string;
  rating: RatingValue;
  firstRating: RatingValue;
  /** ISO timestamp of the latest rating. */
  ratedAt: string;
  /** ISO timestamp of the first rating, i.e. when the word was added. */
  firstRatedAt: string;
  timesRated: number;
  /** The most recent sentence the word was rated from. */
  context: string | null;
}

/** Each word's current rating and where it started, newest first. Events can come in any order. */
export function summarizeWords(events: RatingEvent[]): WordProgress[] {
  const byWord = new Map<string, WordProgress>();
  for (const event of [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const current = byWord.get(event.word);
    if (current) {
      current.rating = event.rating;
      current.ratedAt = event.createdAt;
      current.timesRated += 1;
      if (event.context) current.context = event.context;
    } else {
      byWord.set(event.word, {
        word: event.word,
        rating: event.rating,
        firstRating: event.rating,
        ratedAt: event.createdAt,
        firstRatedAt: event.createdAt,
        timesRated: 1,
        context: event.context ?? null,
      });
    }
  }
  return [...byWord.values()].sort((a, b) => b.ratedAt.localeCompare(a.ratedAt));
}

export interface KnownWordsPoint {
  /** A day the student rated words, as YYYY-MM-DD in the viewer's time zone. */
  date: string;
  /** Words whose rating at the end of that day was KNOWN_RATING or higher. */
  known: number;
  /** Words still being learned at the end of that day (rated LEARNING_RATING or lower). */
  learning: number;
  /** Words in between at the end of that day (rated 3). */
  almost: number;
  /** Words rated at least once by the end of that day. */
  rated: number;
  /** Words whose rating at the end of that day was higher than their first rating. */
  improved: number;
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/**
 * How many words the student knew at the end of each day they rated words. Days without any
 * rating get no point, so the line only moves when the student did something. Uses each word's
 * latest rating as of that day, so a word that drops back below "I really know it" stops counting.
 */
export function knownWordsOverTime(events: RatingEvent[]): KnownWordsPoint[] {
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const points: KnownWordsPoint[] = [];
  const latest = new Map<string, RatingValue>();
  const first = new Map<string, RatingValue>();
  sorted.forEach((event, index) => {
    latest.set(event.word, event.rating);
    if (!first.has(event.word)) first.set(event.word, event.rating);
    const day = dayKey(new Date(event.createdAt));
    const next = sorted[index + 1];
    if (next && dayKey(new Date(next.createdAt)) === day) return;
    let known = 0;
    let learning = 0;
    let improved = 0;
    for (const [word, rating] of latest) {
      if (rating >= KNOWN_RATING) known += 1;
      else if (rating <= LEARNING_RATING) learning += 1;
      if (rating > first.get(word)!) improved += 1;
    }
    points.push({ date: day, known, learning, almost: latest.size - known - learning, rated: latest.size, improved });
  });
  return points;
}

const ENDS_SENTENCE = /[.!?]["')\]]*$/;
/** Words shown on each side of the word when its sentence runs long. */
const CONTEXT_REACH = 18;

/**
 * The sentence around token `index` of an analysis, for showing a word in context. Stops at
 * sentence-ending punctuation and paragraph breaks, and trims very long sentences with "…".
 */
export function sentenceAround(words: WordMatch[], index: number): string {
  if (!words[index]?.initialValue) return "";
  let start = index;
  while (start > 0 && index - start < CONTEXT_REACH) {
    const previous = words[start - 1]!.initialValue;
    if (!previous || ENDS_SENTENCE.test(previous)) break;
    start -= 1;
  }
  let end = index;
  while (end < words.length - 1 && end - index < CONTEXT_REACH && !ENDS_SENTENCE.test(words[end]!.initialValue)) {
    if (!words[end + 1]!.initialValue) break;
    end += 1;
  }
  const truncatedStart = start > 0 && words[start - 1]!.initialValue !== "" && !ENDS_SENTENCE.test(words[start - 1]!.initialValue);
  const truncatedEnd = !ENDS_SENTENCE.test(words[end]!.initialValue) && end < words.length - 1 && words[end + 1]!.initialValue !== "";
  const text = words
    .slice(start, end + 1)
    .map((word) => word.initialValue)
    .join(" ");
  return `${truncatedStart ? "… " : ""}${text}${truncatedEnd ? " …" : ""}`.slice(0, MAX_CONTEXT_LENGTH);
}
