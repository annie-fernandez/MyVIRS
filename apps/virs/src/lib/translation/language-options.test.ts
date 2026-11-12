import { describe, expect, it } from "vitest";
import { languageOptions } from "./language-options";
import { TRANSLATION_LANGUAGES } from "./translation-languages";

describe("languageOptions", () => {
  it("is the plain list without a preferred language", () => {
    expect(languageOptions(null)).toBe(TRANSLATION_LANGUAGES);
  });

  it("is the plain list when the saved code is no longer offered", () => {
    expect(languageOptions("not-a-language")).toBe(TRANSLATION_LANGUAGES);
  });

  it("pins the preferred language first and never lists it twice", () => {
    const [pinned, all] = languageOptions("vi") as { group: string; items: { value: string }[] }[];
    expect(pinned!.items.map((language) => language.value)).toEqual(["vi"]);
    expect(all!.items.some((language) => language.value === "vi")).toBe(false);
    expect(all!.items).toHaveLength(TRANSLATION_LANGUAGES.length - 1);
  });
});
