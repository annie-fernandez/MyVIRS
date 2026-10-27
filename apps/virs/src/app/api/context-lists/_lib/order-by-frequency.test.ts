import type { RankedWord } from "@repo/core";
import { describe, expect, it } from "vitest";
import { orderByFrequency } from "./order-by-frequency";

const word = (headword: string, band: RankedWord["band"], count: number, rank: number): RankedWord => ({
  headword,
  forms: [headword],
  matchSource: "self",
  pos: "NOUN",
  band,
  frequencyCount: null,
  subject: "general",
  gradeLevel: null,
  relevance: 0.5,
  priority: 0.5,
  rank,
  count,
});

describe("orderByFrequency", () => {
  it("ranks by band, then by count, then alphabetically, and renumbers", () => {
    const words = [word("mitosis", "NONE", 40, 1), word("cell", "HIGH", 9, 2), word("water", "HIGH", 9, 3), word("analysis", "MID", 3, 4), word("plant", "HIGH", 30, 5)];
    expect(orderByFrequency(words).map((w) => [w.headword, w.rank, w.priority])).toEqual([
      ["plant", 1, 1],
      ["cell", 2, 1],
      ["water", 3, 1],
      ["analysis", 4, 0.6],
      ["mitosis", 5, 0.1],
    ]);
  });

  it("leaves the list it was given alone", () => {
    const words = [word("b", "NONE", 1, 1), word("a", "HIGH", 1, 2)];
    orderByFrequency(words);
    expect(words.map((w) => w.headword)).toEqual(["b", "a"]);
  });
});
