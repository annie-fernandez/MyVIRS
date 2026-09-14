import type { Word, WordCategory } from "@repo/core";
import Papa from "papaparse";

export function wordsToCsv(words: Word[]): string {
  return Papa.unparse({
    fields: ["value", "category", "grade"],
    data: words.map((word) => [word.value, word.category, word.grade ?? ""]),
  });
}

export function categoriesFilename(categories: WordCategory[]): string {
  return `virs-words-${categories.join("-")}.csv`;
}

export interface CsvWordRecord {
  value: string;
  category?: string;
  grade?: string;
}

/** Accepts files with a `value[,category[,grade]]` header, or a bare one-word-per-line list. */
export function parseWordsCsv(raw: string): CsvWordRecord[] {
  // Papa Parse detects the newline style from the first line, so mixed endings would merge rows.
  const content = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const firstLine = (content.split("\n", 1)[0] ?? "").trim().toLowerCase();
  const hasHeader = firstLine.split(",")[0]?.trim() === "value";

  if (hasHeader) {
    const { data } = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim().toLowerCase(),
    });
    return data.map((row) => ({ value: row.value ?? "", category: row.category, grade: row.grade }));
  }

  const { data } = Papa.parse<string[]>(content, { skipEmptyLines: "greedy" });
  return data.map(([value = ""]) => ({ value }));
}
