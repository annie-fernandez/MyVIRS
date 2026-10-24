import { readFile } from "node:fs/promises";
import { it } from "vitest";
import { analyzeText, type WordListEntry } from "./analyze";
import baselineJson from "./regression/baseline.json";
import wordListJson from "./regression/word-list.json";
import { REGRESSION_PASSAGES } from "./regression/passages";
import { parseWordCategory } from "./categories";
import { normalizeWord } from "./word";

it("diffs", async () => {
  const tally = new Map<string, number>(); const other: string[] = []; const examples = new Set<string>();
  const cmp = (name: string, actual: any, expected: any) => {
    for (const key of Object.keys(expected)) if (key !== "words" && JSON.stringify(actual[key]) !== JSON.stringify(expected[key])) other.push(`${name}.${key}: ${JSON.stringify(expected[key])} -> ${JSON.stringify(actual[key])}`);
    if (actual.words.length !== expected.words.length) other.push(`${name}: word count changed`);
    actual.words.forEach((w: any, i: number) => {
      const e = expected.words[i];
      if (w.value !== e.value || w.initialValue !== e.initialValue) other.push(`${name}[${i}] ${e.value} -> ${w.value}`);
      else if (w.category !== e.category) { const k = `${e.category}->${w.category}`; tally.set(k, (tally.get(k) ?? 0) + 1); if (examples.size < 30) examples.add(`${w.value}: ${k}`); }
    });
  };
  const entries = (wordListJson as any).entries as WordListEntry[];
  const frozen = async (values: string[]) => { const s = new Set(values); return entries.filter((e) => s.has(e.value)); };
  for (const p of REGRESSION_PASSAGES) cmp(`baseline:${p.id}`, await analyzeText(p.text, frozen), (baselineJson as any).passages.find((x: any) => x.id === p.id).result);
  const csv = await readFile(new URL("../../db/seed/words.csv", import.meta.url), "utf8");
  const index = new Map<string, WordListEntry[]>();
  for (const line of csv.trim().split(/\r?\n/).slice(1)) { const [v, c] = line.split(","); const value = normalizeWord(v!); const category = parseWordCategory(c!); if (!value || !category) continue; index.set(value, [...(index.get(value) ?? []), { value, category }]); }
  const lookup = async (values: string[]) => values.flatMap((v) => index.get(v) ?? []);
  const dir = new URL("../fixtures/analyzer/", import.meta.url);
  for (const name of ["easy_01_geography","easy_02_nature","easy_medium_01_chemistry","easy_medium_02_history","medium_01_chemistry","medium_02_biology","medium_hard_01_history","medium_hard_02_psychology","hard_01_economics","hard_02_economics"]) {
    cmp(name, await analyzeText(await readFile(new URL(`${name}.txt`, dir), "utf8"), lookup), JSON.parse(await readFile(new URL(`${name}.expected.json`, dir), "utf8")));
  }
  process.stdout.write("CATEGORY CHANGES " + JSON.stringify([...tally]) + "\nOTHER DIFFS " + JSON.stringify(other) + "\nEXAMPLES " + JSON.stringify([...examples]) + "\n");
});
