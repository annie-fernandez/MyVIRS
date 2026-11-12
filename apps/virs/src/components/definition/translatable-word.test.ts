import { describe, expect, it } from "vitest";
import { translatableWord } from "./translatable-word";

describe("translatableWord", () => {
  it("strips the punctuation around a word", () => {
    expect(translatableWord('"river,"')).toBe("river");
  });

  it("keeps punctuation inside a word", () => {
    expect(translatableWord("don't")).toBe("don't");
    expect(translatableWord("well-known.")).toBe("well-known");
  });

  it("handles letters outside English", () => {
    expect(translatableWord("café!")).toBe("café");
  });

  it.each(["—", "42", "...", ""])("has nothing to translate in %j", (word) => {
    expect(translatableWord(word)).toBeNull();
  });
});
