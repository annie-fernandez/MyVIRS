import type { ContextRanking, RankedWord } from "@repo/core";
import { describe, expect, it } from "vitest";
import { matchPassage } from "./match-passage";

const word = (headword: string, forms: string[], band: RankedWord["band"], count: number, rank: number): RankedWord => ({
  headword,
  forms,
  matchSource: "lemma",
  pos: "NOUN",
  band,
  frequencyCount: null,
  subject: "general",
  gradeLevel: null,
  kLevel: null,
  relevance: 0.5,
  priority: 0.5,
  rank,
  count,
});

const ranking: ContextRanking = {
  textId: "book",
  corpusId: null,
  summary: { tokens: 100, coverageHigh: 0.5, coverageListed: 0.8 },
  words: [word("mitosis", ["mitosis"], "NONE", 40, 1), word("cell", ["cell", "cells"], "HIGH", 9, 2), word("u.s.", ["u.s."], "NONE", 1, 3), word("us", ["us"], "HIGH", 50, 4)],
};

describe("matchPassage", () => {
  it("groups the passage's forms by family, with both of the book's ranks, in context order", () => {
    expect(matchPassage(ranking, { cells: 3, cell: 1, mitosis: 2, frog: 1 })).toEqual({
      words: [
        { headword: "mitosis", forms: ["mitosis"], count: 2, band: "NONE", contextRank: 1, frequencyRank: 3 },
        { headword: "cell", forms: ["cells", "cell"], count: 4, band: "HIGH", contextRank: 2, frequencyRank: 2 },
      ],
      unmatched: 1,
    });
  });

  it("falls back to the singular, and gives a shared normalized form to the higher-ranked family", () => {
    const { words } = matchPassage({ ...ranking, words: [ranking.words[1]!, ranking.words[2]!, ranking.words[3]!] }, { mitoses: 1, us: 1 });
    expect(words.map((w) => w.headword)).toEqual(["u.s."]);
    expect(matchPassage(ranking, { cellss: 1 }).unmatched).toBe(1);
  });
});
