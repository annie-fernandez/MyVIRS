import type { Word } from "@repo/core";
import Papa from "papaparse";

/** A word list as CSV with a value,category,grade header, the format the import accepts. */
export function wordsToCsv(words: Word[]): string {
  return Papa.unparse({
    fields: ["value", "category", "grade"],
    data: words.map((word) => [word.value, word.category, word.grade ?? ""]),
  });
}
