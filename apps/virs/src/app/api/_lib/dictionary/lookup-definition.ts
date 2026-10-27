import "server-only";
import type { DictionaryEntry } from "@repo/core";
import { extractEnglishDefinitions } from "./extract-english-definitions";
import { extractFormOf } from "./extract-form-of";
import { extractPronunciation } from "./extract-pronunciation";
import { fetchExtract } from "./fetch-extract";
import { fetchRecording } from "./fetch-recording";
import { ipaToRespelling } from "./ipa-to-respelling";
import { lookupTitles } from "./lookup-titles";

/** A word's English definitions from Wiktionary, sanitized, with how it's said; null when it has none. */
export async function lookupDefinition(word: string): Promise<DictionaryEntry | null> {
  for (const title of lookupTitles(word)) {
    const extract = await fetchExtract(title);
    const html = extract ? extractEnglishDefinitions(extract) : null;
    if (html) {
      // A missing or unreachable recording only means the browser's voice says the word instead.
      const audioUrl = await fetchRecording(title).catch((error: unknown) => {
        console.error("[dictionary] recording lookup failed", error);
        return null;
      });
      const ipa = extractPronunciation(extract!);
      return { word: title, source: "wiktionary", html, respelling: ipa ? ipaToRespelling(ipa) : null, audioUrl, formOf: extractFormOf(extract!, title) };
    }
  }
  return null;
}
