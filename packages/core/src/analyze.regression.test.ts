import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import { analyzeText, type WordListEntry, type WordLookup } from "./analyze";
import { parseWordCategory } from "./categories";
import { normalizeWord } from "./word";

const fixtures = new URL("../fixtures/analyzer/", import.meta.url);
const passages = [
  "easy_01_geography",
  "easy_02_nature",
  "easy_medium_01_chemistry",
  "easy_medium_02_history",
  "medium_01_chemistry",
  "medium_02_biology",
  "medium_hard_01_history",
  "medium_hard_02_psychology",
  "hard_01_economics",
  "hard_02_economics",
];

// This is a regression test for the analyzer. It loads a dictionary of words and their categories, 
// then runs the analyzer on a set of passages and compares the output to expected results. 
// If the analyzer's behavior changes in a way that affects these passages, this test will fail, alerting 
// developers to the change.
async function loadWordLookup(): Promise<WordLookup> {
  const csv = await readFile(
    new URL("../../db/seed/words.csv", import.meta.url),
    "utf8",
  );
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  expect(header).toBe("value,category,grade");
  const index = new Map<string, WordListEntry[]>();

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.includes('"') || line.split(",").length !== 3) {
      throw new Error(
        "Seed CSV format changed; update the regression dictionary loader.",
      );
    }
    const [rawValue, rawCategory] = line.split(",");
    const value = normalizeWord(rawValue!);
    const category = parseWordCategory(rawCategory!);
    if (!value || !category) continue;
    const entries = index.get(value) ?? [];
    entries.push({ value, category });
    index.set(value, entries);
  }

  expect(index.size).toBeGreaterThan(0);
  return async (values) => values.flatMap((value) => index.get(value) ?? []);
}

describe("analyzer passage regression", () => {
  let lookup: WordLookup;

  beforeAll(async () => {
    lookup = await loadWordLookup();
  });

  it.each(passages)("%s matches its expected output", async (name) => {
    const [text, expectedJson] = await Promise.all([
      readFile(new URL(`${name}.txt`, fixtures), "utf8"),
      readFile(new URL(`${name}.expected.json`, fixtures), "utf8"),
    ]);

    const actual = await analyzeText(text, lookup);

    expect(actual).toStrictEqual(JSON.parse(expectedJson));
  });
});
