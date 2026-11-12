import { describe, expect, it } from "vitest";
import { browserLanguage } from "./browser-language";

describe("browserLanguage", () => {
  it("is the first language that isn't English", () => {
    expect(browserLanguage(["en-US", "es-MX", "fr"])).toBe("es");
  });

  it("is null for an English-only browser, or none at all", () => {
    expect(browserLanguage(["en-US", "en"])).toBeNull();
    expect(browserLanguage([])).toBeNull();
  });

  it("keeps a regional code when it's offered", () => {
    expect(browserLanguage(["pt-PT"])).toBe("pt-PT");
    expect(browserLanguage(["pt-BR"])).toBe("pt");
    expect(browserLanguage(["fa-AF"])).toBe("fa-AF");
  });

  it("tells simplified and traditional Chinese apart", () => {
    expect(browserLanguage(["zh-CN"])).toBe("zh-CN");
    expect(browserLanguage(["zh"])).toBe("zh-CN");
    expect(browserLanguage(["zh-TW"])).toBe("zh-TW");
    expect(browserLanguage(["zh-Hant-HK"])).toBe("zh-TW");
  });

  it("maps codes Google names differently", () => {
    expect(browserLanguage(["tl-PH"])).toBe("fil");
    expect(browserLanguage(["no"])).toBe("nb");
  });

  it("skips languages we can't translate into", () => {
    expect(browserLanguage(["xx-YY", "vi-VN"])).toBe("vi");
  });
});
