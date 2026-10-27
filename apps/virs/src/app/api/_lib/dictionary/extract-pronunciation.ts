import { HTMLElement, parse } from "node-html-parser";
import { sectionAnchor } from "./section-anchor";

// A pronunciation line's region label, e.g. "(US)" or "(General American, Canada)".
const AMERICAN = /\([^)]*\b(?:US|General American|GA)\b[^)]*\)/;
// Any region label at all; a line without one is how Wiktionary writes a pronunciation shared by all.
const REGION = /^\s*\([^)]*\)/;
// The first transcription after "IPA", e.g. /ˈfoʊ.təˌɡɹæf/ (not the [narrow] one that may follow).
const IPA = /IPA[^/]*?(\/[^/\n]+\/)/;

/**
 * One IPA transcription from a Wiktionary extract's English Pronunciation section: the American one,
 * or failing that one with no region (shared by all accents). Never a British-only one, which would
 * respell water as WAW-tuh. Turned into the respelling shown beside the Listen buttons.
 */
export function extractPronunciation(extractHtml: string): string | null {
  const elements = parse(extractHtml).childNodes.filter((node): node is HTMLElement => node instanceof HTMLElement);

  let inEnglish = false;
  let inPronunciation = false;
  const lines: string[] = [];

  for (const element of elements) {
    const tag = element.tagName.toLowerCase();
    if (tag === "h2") {
      if (inEnglish) break;
      inEnglish = sectionAnchor(element) === "English";
      continue;
    }
    if (!inEnglish) continue;
    if (/^h[3-6]$/.test(tag)) {
      // Words with several etymologies have a Pronunciation section under each; the first one wins.
      if (lines.length) break;
      inPronunciation = sectionAnchor(element).split("_")[0]?.toLowerCase() === "pronunciation";
      continue;
    }
    if (inPronunciation) lines.push(...element.querySelectorAll("li").map((item) => item.textContent));
  }

  const withIpa = lines.filter((line) => IPA.test(line));
  const line = withIpa.find((candidate) => AMERICAN.test(candidate)) ?? withIpa.find((candidate) => !REGION.test(candidate));
  return line?.match(IPA)?.[1] ?? null;
}
