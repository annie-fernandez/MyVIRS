import { readFile } from "node:fs/promises";
import { normalizeWord, parseGrade, parseWordCategory } from "@repo/core";
import Papa from "papaparse";
import { createDb } from "../src/client";
import { importWords } from "../src/queries/words";
import type { NewWordRow } from "../src/schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const csv = await readFile(new URL("../seed/words.csv", import.meta.url), "utf8");
const { data } = Papa.parse<{ value: string; category: string; grade: string }>(csv, {
  header: true,
  skipEmptyLines: true,
});

const rows: NewWordRow[] = data.flatMap((record) => {
  const category = parseWordCategory(record.category);
  const value = normalizeWord(record.value);
  return category && value ? [{ value, category, grade: parseGrade(record.grade) ?? null }] : [];
});

const count = await importWords(createDb(url), rows, { replace: false });
console.log(`Seeded ${count} words.`);
