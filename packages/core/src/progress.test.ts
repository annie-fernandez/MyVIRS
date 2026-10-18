import { describe, expect, it } from "vitest";
import { knownWordsOverTime, rateWordInput, sentenceAround, summarizeWords, wordStage, type RatingEvent } from "./progress";
import type { WordMatch } from "./analyze";

const at = (day: number, hour = 12) => new Date(2026, 9, day, hour).toISOString();

describe("summarizeWords", () => {
  it("keeps each word's first and latest rating, newest first", () => {
    const events: RatingEvent[] = [
      { word: "glucose", rating: 2, createdAt: at(10) },
      { word: "leaf", rating: 5, createdAt: at(11) },
      { word: "glucose", rating: 4, createdAt: at(12) },
    ];
    events[0]!.context = "Plants make glucose.";
    expect(summarizeWords(events)).toEqual([
      { word: "glucose", rating: 4, firstRating: 2, ratedAt: at(12), firstRatedAt: at(10), timesRated: 2, context: "Plants make glucose." },
      { word: "leaf", rating: 5, firstRating: 5, ratedAt: at(11), firstRatedAt: at(11), timesRated: 1, context: null },
    ]);
  });
});

describe("knownWordsOverTime", () => {
  it("is empty without ratings", () => {
    expect(knownWordsOverTime([])).toEqual([]);
  });

  it("has one point per day with ratings, using each word's latest rating, and skips days without any", () => {
    const events: RatingEvent[] = [
      { word: "glucose", rating: 2, createdAt: at(10) },
      { word: "leaf", rating: 4, createdAt: at(10, 9) },
      { word: "glucose", rating: 5, createdAt: at(11) },
      // Nothing on the 12th or 13th.
      { word: "leaf", rating: 3, createdAt: at(14) },
    ];
    expect(knownWordsOverTime(events)).toEqual([
      { date: "2026-10-10", known: 1, learning: 1, almost: 0, rated: 2, improved: 0 },
      { date: "2026-10-11", known: 2, learning: 0, almost: 0, rated: 2, improved: 1 },
      { date: "2026-10-14", known: 1, learning: 0, almost: 1, rated: 2, improved: 1 },
    ]);
  });
});

describe("rateWordInput", () => {
  it("normalizes the word and accepts only 1 to 5", () => {
    expect(rateWordInput.parse({ word: " Glucose, ", rating: 3 })).toMatchObject({ word: "glucose", rating: 3 });
    expect(rateWordInput.safeParse({ word: "leaf", rating: 6 }).success).toBe(false);
    expect(rateWordInput.safeParse({ word: "...", rating: 2 }).success).toBe(false);
  });
});

describe("sentenceAround", () => {
  const tokens = (text: string): WordMatch[] =>
    text.split(" ").map((token) => (token === "¶" ? { initialValue: "" } : { initialValue: token })) as WordMatch[];

  it("returns the sentence a word sits in, stopping at punctuation and paragraph breaks", () => {
    const words = tokens("Plants need light. They make glucose from water. ¶ Next paragraph here.");
    expect(sentenceAround(words, 4)).toBe("They make glucose from water.");
    expect(sentenceAround(words, 0)).toBe("Plants need light.");
    expect(sentenceAround(words, 9)).toBe("Next paragraph here.");
  });

  it("trims a very long sentence on both sides", () => {
    const long = Array.from({ length: 80 }, (_, i) => `w${i}`).join(" ") + ".";
    const context = sentenceAround(tokens(long), 40);
    expect(context.startsWith("… w22")).toBe(true);
    expect(context.endsWith("w58 …")).toBe(true);
  });
});

describe("wordStage", () => {
  it("groups ratings into learning, almost and known", () => {
    expect([1, 2, 3, 4, 5].map((rating) => wordStage(rating as 1))).toEqual(["learning", "learning", "almost", "known", "known"]);
  });
});
