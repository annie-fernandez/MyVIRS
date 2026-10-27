import { describe, expect, it } from "vitest";
import { ipaToRespelling } from "./ipa-to-respelling";

describe("ipaToRespelling", () => {
  it.each([
    ["/ˈfoʊ.təˌɡɹæf/", "FOH-tuh-graf"],
    ["/ˌfoʊ.toʊˈsɪn.θə.sɪs/", "foh-toh-SIN-thuh-sis"],
    ["/əˈnælɪsɪs/", "uh-NAL-ih-sis"],
    ["/ˈɛnɚd͡ʒi/", "EN-er-jee"],
    ["/ɪmˈpɔɹ.tənt/", "im-POR-tuhnt"],
    ["/ˈbju.tɪ.fəl/", "BYOO-tih-fuhl"],
    ["/ɪnˈvaɪ.ɚn.mənt/", "in-VY-ern-muhnt"],
    ["/ˈkɛm.ɪ.kəl/", "KEM-ih-kuhl"],
    ["/ˈbʌʔ.n̩/", "BUT-n"],
    ["/ˈfɛb.ɹuˌɛɹi/", "FEB-roo-air-ee"],
    ["/baɪˈɑləd͡ʒi/", "by-AH-luh-jee"],
    ["/ˈɔɹ.ɡəˌnɪz.əm/", "OR-guh-niz-uhm"],
  ])("%s → %s", (ipa, respelling) => {
    expect(ipaToRespelling(ipa)).toBe(respelling);
  });

  it("leaves one-syllable words in lower case", () => {
    expect(ipaToRespelling("/ɹid/")).toBe("reed");
    expect(ipaToRespelling("/sɛl/")).toBe("sel");
    expect(ipaToRespelling("/sfɪɚ/")).toBe("sfeer");
    expect(ipaToRespelling("/faɪɚ/")).toBe("fire");
  });

  it("returns null for anything it can't read, rather than guess", () => {
    expect(ipaToRespelling("/ˈwɔː.tə ʘ/")).toBeNull();
    expect(ipaToRespelling("")).toBeNull();
  });
});
