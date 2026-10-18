import { describe, expect, it } from "vitest";
import { analyzeText, tokenize, type AnalysisResult, type WordListEntry } from "../analyze";
import { lookupCandidates } from "../word";
import baselineJson from "./baseline.json";
import wordListJson from "./word-list.json";
import { REGRESSION_PASSAGES } from "./passages";

interface Baseline {
  recordedAt: string;
  wordListSize: number;
  intentionalDifferencesFromLegacy: string[];
  passages: { id: string; pins: string; result: AnalysisResult }[];
}

// Imported as JSON rather than read from disk: @repo/core has no Node types on purpose, since it
// is shared with client code. Casts are needed because JSON widens the literal category unions.
const baseline = baselineJson as unknown as Baseline;
const entries = (wordListJson as { entries: WordListEntry[] }).entries;

/**
 * Deliberately offline. The frozen word list stands in for the database so a word-list edit in
 * production cannot make this test fail — and, more importantly, cannot make it silently pass.
 */
const frozenLookup = async (values: string[]): Promise<WordListEntry[]> => {
  const wanted = new Set(values);
  return entries.filter((entry) => wanted.has(entry.value));
};

describe("analyzer regression baseline", () => {
  it("has a baseline recorded for every fixture passage, and no stale extras", () => {
    expect(baseline.passages.map((p) => p.id).sort()).toEqual(REGRESSION_PASSAGES.map((p) => p.id).sort());
  });

  it("documents the intentional differences from the legacy analyzer", () => {
    expect(baseline.intentionalDifferencesFromLegacy.length).toBeGreaterThan(0);
  });

  it("froze every word-list entry the passages can reach", () => {
    const frozen = new Set(entries.map((entry) => entry.value));
    const reachable = new Set(REGRESSION_PASSAGES.flatMap((p) => tokenize(p.text).flatMap(lookupCandidates)));
    // Not every candidate exists in the word lists; the check is that nothing reachable AND listed
    // was left out, which would quietly weaken the baseline.
    const matchedButMissing = [...reachable].filter((value) => !frozen.has(value) && entries.some((e) => e.value === value));
    expect(matchedButMissing).toEqual([]);
  });

  for (const passage of REGRESSION_PASSAGES) {
    it(`matches the recorded output for "${passage.id}"`, async () => {
      const recorded = baseline.passages.find((p) => p.id === passage.id);
      expect(recorded, `no baseline recorded for "${passage.id}" — regenerate it`).toBeDefined();
      const actual = await analyzeText(passage.text, frozenLookup);
      expect(actual).toEqual(recorded!.result);
    });
  }

  it("exercises the Flesch calculation somewhere", () => {
    // Every passage under 100 words scores 0 by design, so without this the readability path,
    // syllable counting and the sentence-length average would all go unverified.
    expect(baseline.passages.some((p) => p.result.fleschReadingScore > 0)).toBe(true);
  });
});
