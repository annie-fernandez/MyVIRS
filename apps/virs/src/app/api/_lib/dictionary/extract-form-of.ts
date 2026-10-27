import type { FormOf } from "@repo/core";
import { HTMLElement, parse } from "node-html-parser";
import { sectionAnchor } from "./section-anchor";

// Usage labels that mark a sense as one a K-12 reader won't mean: "(chiefly humorous) plural of shoop".
const RESTRICTED = /\b(obsolete|archaic|dialect(al)?|nonstandard|rare|regional|slang|humorous|eye dialect|misspelling|uncommon|historical|poetic|nautical)\b/i;

/**
 * What a word is a form of, from the English senses of a Wiktionary extract: "plural of cell",
 * "simple past and past participle of photograph". Wiktionary tags the base word as a mention
 * (<i class="mention">). `only` is true when every sense is such a form, as for "cells", whose own
 * entry says nothing a reader can use.
 *
 * Mentioned only when it's the word's first sense ("cells", "mice"), or an -ing or past form first under
 * a Verb heading ("handling", whose noun comes first; "saw", past tense of "see"). Plural nouns further down
 * are left out: they'd have the panel call "his" the plural of "hi" and "news" the plural of "new".
 * Never a sense labelled obsolete, dialect and so on, and never a form of itself ("read"). Null otherwise.
 */
export function extractFormOf(extractHtml: string, title: string): FormOf | null {
  const elements = parse(extractHtml).childNodes.filter((node): node is HTMLElement => node instanceof HTMLElement);

  let inEnglish = false;
  let heading = "";
  const senses: HTMLElement[] = [];
  // The first sense under each part-of-speech heading, in order.
  const leads: { heading: string; sense: HTMLElement }[] = [];
  for (const element of elements) {
    const tag = element.tagName.toLowerCase();
    if (tag === "h2") {
      if (inEnglish) break;
      inEnglish = sectionAnchor(element) === "English";
      continue;
    }
    if (!inEnglish) continue;
    if (/^h[3-6]$/.test(tag)) heading = sectionAnchor(element).split("_")[0]?.toLowerCase() ?? "";
    // Each part of speech lists its senses in an <ol>; nested lists are examples and sub-senses.
    if (tag !== "ol") continue;
    const items = element.childNodes.filter((node): node is HTMLElement => node instanceof HTMLElement && node.tagName === "LI" && ownText(node) !== "");
    senses.push(...items);
    if (items[0]) leads.push({ heading, sense: items[0] });
  }

  const usable = (sense: HTMLElement | undefined) => {
    const form = sense ? formOfSense(sense) : null;
    return form && form.base.toLowerCase() !== title.toLowerCase() && !RESTRICTED.test(usageLabel(sense!)) ? form : null;
  };
  // From a Verb section, only -ing and past forms: an -s form ("physics", third-person singular of an old
  // verb "physic") looks like a plural and misleads the same way.
  const verbForm = leads
    .filter((lead) => lead.heading === "verb")
    .map((lead) => usable(lead.sense))
    .find((form) => form && ["ing", "past"].includes(relationOf(form.text)));
  const found = usable(senses[0]) ?? verbForm;
  if (!found) return null;
  return { base: found.base, relation: relationOf(found.text), only: senses.every((sense) => formOfSense(sense)) };
}

/** A sense's leading usage label, e.g. "obsolete" in "(obsolete) plural of hi". */
function usageLabel(sense: HTMLElement): string {
  return ownText(sense).match(/^\(([^)]*)\)/)?.[1] ?? "";
}

/** The base word and the sense's text when the sense is "<relation> of <base>", else null. */
function formOfSense(sense: HTMLElement): { base: string; text: string } | null {
  const mention = sense.querySelector("i.mention");
  const text = ownText(sense).toLowerCase();
  const base = mention?.textContent.trim() ?? "";
  return base && / of\b/.test(text) && text.endsWith(base.toLowerCase()) ? { base, text } : null;
}


/** The sense's own words, without its nested examples and sub-senses. */
function ownText(sense: HTMLElement): string {
  return sense.childNodes
    .filter((node) => !(node instanceof HTMLElement && ["OL", "UL", "DL"].includes(node.tagName)))
    .map((node) => node.textContent)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Wiktionary's grammar terms, in the words the panel uses ("past tense of", not "simple past of"). */
function relationOf(text: string): FormOf["relation"] {
  if (text.includes("plural")) return "plural";
  if (text.includes("comparative")) return "comparative";
  if (text.includes("superlative")) return "superlative";
  if (text.includes("past")) return "past";
  if (text.includes("present participle")) return "ing";
  return "form";
}
