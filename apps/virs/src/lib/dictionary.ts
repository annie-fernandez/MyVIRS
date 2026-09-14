import "server-only";
import { removePunctuation, singularize, type DictionaryEntry } from "@repo/core";
import { HTMLElement, parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";

const WIKTIONARY_API = "https://en.wiktionary.org/w/api.php";
// Wikimedia's API policy requires an identifying User-Agent.
const USER_AGENT = "VIRS/2.0 (https://myvirs.com; vocabinreading@gmail.com)";
const ONE_DAY_SECONDS = 60 * 60 * 24;

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

interface WiktionaryResponse {
  query?: {
    pages?: Record<string, { title: string; missing?: string; extract?: string }>;
  };
}

/** Lowercase first: a capitalized token is usually just the start of a sentence. */
function lookupTitles(word: string): string[] {
  const asWritten = removePunctuation(word);
  const lower = asWritten.toLowerCase();
  return [...new Set([lower, singularize(lower), asWritten].filter(Boolean))];
}

function sectionAnchor(heading: HTMLElement): string {
  return (
    heading.getAttribute("data-mw-anchor") ??
    heading.querySelector("span[id]")?.getAttribute("id") ??
    heading.getAttribute("id") ??
    ""
  );
}

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

async function fetchExtract(title: string): Promise<string | null> {
  const url = new URL(WIKTIONARY_API);
  // Full-article extracts are limited to one title per request.
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "1",
    action: "query",
    prop: "extracts",
    exlimit: "1",
    titles: title,
  }).toString();

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: ONE_DAY_SECONDS },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Wiktionary responded with ${response.status}`);

  const pages = Object.values(((await response.json()) as WiktionaryResponse).query?.pages ?? {});
  const page = pages.find((candidate) => candidate.missing === undefined);
  return page?.extract ?? null;
}

export async function lookupDefinition(word: string): Promise<DictionaryEntry | null> {
  for (const title of lookupTitles(word)) {
    const extract = await fetchExtract(title);
    const html = extract ? extractEnglishDefinitions(extract) : null;
    if (html) return { word: title, source: "wiktionary", html };
  }
  return null;
}
