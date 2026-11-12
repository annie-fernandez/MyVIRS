import { describe, expect, it } from "vitest";
import { assertValidPreferredLanguage } from "./assert-valid-preferred-language";

describe("assertValidPreferredLanguage", () => {
  it.each([undefined, null, "", "vi", "zh-CN"])("accepts %s", (value) => {
    expect(() => assertValidPreferredLanguage(value)).not.toThrow();
  });

  it.each(["en", "klingon", 42])("rejects %s", (value) => {
    expect(() => assertValidPreferredLanguage(value)).toThrow();
  });
});
