import { describe, expect, it, vi } from "vitest";
import {
  analyzeText,
  countSentences,
  fleschReadingEase,
  tokenize,
  type WordListEntry,
} from "./analyze";
import { readingLevel } from "./readability";
import { countSyllables, lookupCandidates } from "./word";

function lookupFrom(entries: WordListEntry[]) {
  return vi.fn(async (values: string[]) => entries.filter((entry) => values.includes(entry.value)));
}

describe("tokenize", () => {
  it("keeps empty tokens for consecutive whitespace so line breaks survive", () => {
    expect(tokenize("one\n\ntwo")).toEqual(["one", "", "two"]);
  });

  it("returns no tokens for blank text", () => {
    expect(tokenize("   \n ")).toEqual([]);
  });
});

describe("lookupCandidates", () => {
  it("strips punctuation before singularizing", () => {
    expect(lookupCandidates("Books.")).toEqual(["books", "book"]);
  });

  it("does not singularize short words", () => {
    expect(lookupCandidates("bus")).toEqual(["bus"]);
  });

  it("returns nothing for punctuation-only tokens", () => {
    expect(lookupCandidates("—")).toEqual([]);
  });
});

describe("countSyllables", () => {
  it.each([
    ["the", 1],
    ["make", 1],
    ["water", 2],
    ["beautiful", 3],
    ["rhythm", 1],
  ])("%s has %i syllable(s)", (word, expected) => {
    expect(countSyllables(word)).toBe(expected);
  });
});

describe("countSentences", () => {
  it("splits on terminal punctuation followed by whitespace", () => {
    expect(countSentences("I like cats. Do you? Yes!")).toBe(3);
  });

  it("does not split decimal numbers", () => {
    expect(countSentences("Pi is 3.14 roughly.")).toBe(1);
  });

  it("is zero for blank text", () => {
    expect(countSentences("")).toBe(0);
  });
});

describe("fleschReadingEase", () => {
  it("is zero below 100 words", () => {
    expect(fleschReadingEase(99, 5, 120)).toBe(0);
  });

  it("clamps to 0..100", () => {
    expect(fleschReadingEase(200, 200, 200)).toBe(100);
    expect(fleschReadingEase(200, 1, 1000)).toBe(0);
  });
});

describe("readingLevel", () => {
  it("covers fractional scores between integer bands", () => {
    expect(readingLevel(29.5, 150)).toBe("college");
    expect(readingLevel(79.9, 150)).toBe("intermediate");
    expect(readingLevel(85, 150)).toBe("beginner");
  });

  it("explains a zero score", () => {
    expect(readingLevel(0, 20)).toBe("too-short");
    expect(readingLevel(0, 500)).toBe("needs-more-sentences");
  });
});

describe("analyzeText", () => {
  it("matches words to the highest-priority category and counts off-list words", async () => {
    const lookup = lookupFrom([
      { value: "house", category: "k2" },
      { value: "house", category: "k1" },
      { value: "analysis", category: "awl" },
    ]);

    const result = await analyzeText("Houses need analysis, Alice.", lookup);

    expect(result.words).toEqual([
      { initialValue: "Houses", value: "house", category: "k1" },
      { initialValue: "need", value: null, category: null },
      { initialValue: "analysis,", value: "analysis", category: "awl" },
      { initialValue: "Alice.", value: null, category: null },
    ]);
    expect(result.statistics.wordCount).toMatchObject({ k1: 1, awl: 1, offList: 2, total: 4 });
    expect(result.statistics.wordPercentage.k1).toBe(0.25);
    expect(result.sentenceCount).toBe(1);
  });

  it("prefers the word as written over its singular form", async () => {
    const lookup = lookupFrom([
      { value: "glasses", category: "k2" },
      { value: "glass", category: "k1" },
    ]);

    const result = await analyzeText("glasses", lookup);

    expect(result.words[0]).toMatchObject({ value: "glasses", category: "k2" });
  });

  it("queries each distinct value once, in batches", async () => {
    const lookup = lookupFrom([]);
    const text = Array.from({ length: 2500 }, (_, i) => `word${i}`).join(" ");

    await analyzeText(`${text} ${text}`, lookup);

    expect(lookup).toHaveBeenCalledTimes(3);
    const queried = lookup.mock.calls.flatMap(([values]) => values);
    expect(new Set(queried).size).toBe(queried.length);
  });

  it("does not count punctuation-only tokens as words", async () => {
    const result = await analyzeText("hello - world", lookupFrom([]));
    expect(result.statistics.wordCount.total).toBe(2);
  });
});
