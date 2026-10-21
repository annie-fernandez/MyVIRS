import { HTMLElement, parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";
import { sectionAnchor } from "./section-anchor";

const ALLOWED_SECTIONS = new Set([
  "verb",
  "adverb",
  "noun",
  "pronoun",
  "adjective",
  "pronunciation",
  "particle",
  "preposition",
  "conjunction",
  "article",
  "interjection",
  "determiner",
  "numeral",
]);

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["h3", "h4", "h5", "p", "ul", "ol", "li", "dl", "dt", "dd", "i", "b", "em", "strong", "span", "sup", "sub", "br"],
  allowedAttributes: { "*": ["lang"] },
  exclusiveFilter: (frame) => frame.tag !== "br" && !frame.text.trim() && !frame.mediaChildren.length,
};

/** Keeps only the English part-of-speech and pronunciation sections of a Wiktionary extract. */
export function extractEnglishDefinitions(extractHtml: string): string | null {
  const elements = parse(extractHtml).childNodes.filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );

  let inEnglish = false;
  let includeSection = false;
  const kept: string[] = [];

  for (const element of elements) {
    const tag = element.tagName.toLowerCase();
    if (tag === "h2") {
      if (inEnglish) break;
      inEnglish = sectionAnchor(element) === "English";
      continue;
    }
    if (!inEnglish) continue;
    if (tag === "hr") break;
    if (/^h[3-6]$/.test(tag)) {
      const name = sectionAnchor(element).split("_")[0]?.toLowerCase() ?? "";
      includeSection = ALLOWED_SECTIONS.has(name);
    }
    if (includeSection) kept.push(element.outerHTML);
  }

  const html = sanitizeHtml(kept.join("\n"), SANITIZE_OPTIONS).trim();
  return html || null;
}
