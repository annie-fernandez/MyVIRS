import "server-only";
import type { DictionaryEntry } from "@repo/core";
import { extractEnglishDefinitions } from "./extract-english-definitions";
import { fetchExtract } from "./fetch-extract";
import { lookupTitles } from "./lookup-titles";

/** A word's English definitions from Wiktionary, sanitized, or null when it has none. */
export async function lookupDefinition(word: string): Promise<DictionaryEntry | null> {
  for (const title of lookupTitles(word)) {
    const extract = await fetchExtract(title);
    const html = extract ? extractEnglishDefinitions(extract) : null;
    if (html) return { word: title, source: "wiktionary", html };
  }
  return null;
}
