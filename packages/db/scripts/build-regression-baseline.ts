/**
 * Records the analyzer regression baseline.
 *
 * Reads the fixture passages, extracts from Neon exactly the word-list entries those passages
 * touch, freezes them alongside the expected analyzer output, and writes both into
 * packages/core/src/regression/. The test then runs entirely offline against the frozen copy.
 *
 * Freezing matters: admins can edit the word lists, so a baseline derived from the live database at
 * test time would drift for reasons unrelated to the analyzer, and the test would stop detecting
 * anything real.
 *
 *   pnpm --filter @repo/db db:build-regression-baseline
 *
 * Run it deliberately and review the resulting diff — never as a reflex to make a red test green.
 */
import { writeFile } from "node:fs/promises";
import { analyzeText, lookupCandidates, REGRESSION_PASSAGES, tokenize, type WordListEntry } from "@repo/core";
import { createDb } from "../src/client";
import { lookupWords } from "../src/queries/words";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const outDir = new URL("../../core/src/regression/", import.meta.url);
const db = createDb(url);

// Every value any passage could possibly match, so the frozen list is complete but no larger.
const candidates = [...new Set(REGRESSION_PASSAGES.flatMap((p) => tokenize(p.text).flatMap(lookupCandidates)))].sort();
const entries = await lookupWords(db, candidates);

// A word can appear in several categories; keep them all, ordered so the file is stable.
const wordList: WordListEntry[] = [...entries].sort(
  (a, b) => a.value.localeCompare(b.value) || a.category.localeCompare(b.category),
);

const frozenLookup = async (values: string[]): Promise<WordListEntry[]> => {
  const wanted = new Set(values);
  return wordList.filter((entry) => wanted.has(entry.value));
};

const baseline = {
  $comment:
    "GENERATED FILE — do not hand-edit. Produced by packages/db/scripts/build-regression-baseline.ts. " +
    "Expected analyzer output for the fixture passages, recorded against the frozen word list in " +
    "word-list.json. Regenerate with `pnpm --filter @repo/db db:build-regression-baseline` only as a " +
    "deliberate, reviewed change.",
  intentionalDifferencesFromLegacy: [
    "Paragraph breaks: blank line only. The Spring app also broke on a double space.",
    "Lookup order: the token as written is tried before its singular form.",
    "Punctuation is stripped before lookup, so hyphenated entries such as co-worker match.",
    "Basic Academic Words (baw) are counted in the statistics; the legacy app dropped them from totals.",
    "Academic (awl) and STEM win over K1-K3 when a word is on both lists; the legacy app preferred the K lists.",
    "13 hyphenated duplicates were merged during the migration (non-essential -> nonessential).",
    "The Oxford dictionary is not available (its v1 API is shut down); Wiktionary only.",
  ],
  recordedAt: new Date().toISOString().slice(0, 10),
  wordListSize: wordList.length,
  passages: await Promise.all(
    REGRESSION_PASSAGES.map(async (passage) => ({
      id: passage.id,
      pins: passage.pins,
      result: await analyzeText(passage.text, frozenLookup),
    })),
  ),
};

await writeFile(
  new URL("word-list.json", outDir),
  `${JSON.stringify({ $comment: "GENERATED FILE — frozen word-list entries the fixture passages touch.", entries: wordList }, null, 2)}\n`,
);
await writeFile(new URL("baseline.json", outDir), `${JSON.stringify(baseline, null, 2)}\n`);

console.log(
  `Recorded ${baseline.passages.length} passages against ${wordList.length} frozen word-list entries ` +
    `(from ${candidates.length} candidate lookups).`,
);
