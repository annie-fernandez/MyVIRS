import { describe, expect, it } from "vitest";
import { parseWordsCsv } from "./parse-words-csv";
import { wordsToCsv } from "./words-to-csv";

describe("wordsToCsv", () => {
  it("round-trips through parseWordsCsv", () => {
    const csv = wordsToCsv([{ id: 1, value: "o,dd", category: "awl", grade: null }]);
    expect(parseWordsCsv(csv)).toEqual([{ value: "o,dd", category: "awl", grade: "" }]);
  });
});
