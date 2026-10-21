import { describe, expect, it } from "vitest";
import { parseWordsCsv } from "./parse-words-csv";

describe("parseWordsCsv", () => {
  it("reads value/category/grade columns in any header case", () => {
    expect(parseWordsCsv("Value,Category,Grade\r\nbook,K1,G2\nrun,k2,\n")).toEqual([
      { value: "book", category: "K1", grade: "G2" },
      { value: "run", category: "k2", grade: "" },
    ]);
  });

  it("ignores a UTF-8 byte order mark", () => {
    expect(parseWordsCsv("﻿value\nbook")).toEqual([{ value: "book", category: undefined, grade: undefined }]);
  });

  it("treats a file without a header as one word per line", () => {
    expect(parseWordsCsv("apple\n\nbanana, ignored\n")).toEqual([{ value: "apple" }, { value: "banana" }]);
  });
});
