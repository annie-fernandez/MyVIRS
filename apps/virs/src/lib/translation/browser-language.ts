import { TRANSLATION_LANGUAGES } from "./translation-languages";

const OFFERED = new Map(TRANSLATION_LANGUAGES.map((language) => [language.value.toLowerCase(), language.value]));

/** Browser codes that Google names differently. */
const ALIASES: Record<string, string> = { tl: "fil", iw: "he", no: "nb", nn: "nb" };

/** A Chinese tag in traditional characters (zh-Hant, zh-TW, zh-HK, zh-MO). */
const TRADITIONAL_CHINESE = /^zh-(hant|tw|hk|mo)\b/;

/**
 * The first language the student's browser is set to that we can translate into, other than English
 * (the language they're reading), or null. Pass navigator.languages, e.g. ["es-MX", "es", "en-US"].
 * This is the student's own setting, so it's a fair default before they've picked a language.
 */
export function browserLanguage(tags: readonly string[]): string | null {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    const base = lower.split("-")[0]!;
    if (base === "en") continue;
    if (base === "zh") return TRADITIONAL_CHINESE.test(lower) ? "zh-TW" : "zh-CN";
    const offered = OFFERED.get(lower) ?? OFFERED.get(base) ?? OFFERED.get(ALIASES[base] ?? "");
    if (offered) return offered;
  }
  return null;
}
