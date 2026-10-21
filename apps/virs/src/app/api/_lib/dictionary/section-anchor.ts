import type { HTMLElement } from "node-html-parser";

/** A Wiktionary heading's anchor, e.g. "English" or "Noun_2". */
export function sectionAnchor(heading: HTMLElement): string {
  return (
    heading.getAttribute("data-mw-anchor") ??
    heading.querySelector("span[id]")?.getAttribute("id") ??
    heading.getAttribute("id") ??
    ""
  );
}
