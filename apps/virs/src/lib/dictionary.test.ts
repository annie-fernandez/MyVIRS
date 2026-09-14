import { describe, expect, it } from "vitest";
import { extractEnglishDefinitions } from "./dictionary";

const EXTRACT = `
<h2 data-mw-anchor="English" data-mw-wikitext="">English</h2>
<h3 data-mw-anchor="Pronunciation" data-mw-wikitext="">Pronunciation</h3>
<ul><li>IPA: <span>/bʊk/</span></li></ul>
<h3 data-mw-anchor="Etymology_1" data-mw-wikitext="">Etymology 1</h3>
<p>From Middle English bok.</p>
<h4 data-mw-anchor="Noun" data-mw-wikitext="">Noun</h4>
<ol><li class="sense" onclick="alert(1)">A collection of sheets of paper.<script>alert(1)</script></li><li></li></ol>
<h4 data-mw-anchor="Verb_2" data-mw-wikitext="">Verb</h4>
<ol><li>To reserve.</li></ol>
<h4 data-mw-anchor="Derived_terms" data-mw-wikitext="">Derived terms</h4>
<ul><li>bookworm</li></ul>
<h2 data-mw-anchor="Dutch" data-mw-wikitext="">Dutch</h2>
<h3 data-mw-anchor="Noun" data-mw-wikitext="">Noun</h3>
<ol><li>beech</li></ol>`;

describe("extractEnglishDefinitions", () => {
  const html = extractEnglishDefinitions(EXTRACT)!;

  it("keeps English pronunciation and part-of-speech sections", () => {
    expect(html).toContain("/bʊk/");
    expect(html).toContain("A collection of sheets of paper.");
    expect(html).toContain("To reserve.");
  });

  it("drops etymology, derived terms and other languages", () => {
    expect(html).not.toContain("Middle English");
    expect(html).not.toContain("bookworm");
    expect(html).not.toContain("beech");
  });

  it("sanitizes markup and removes empty elements", () => {
    expect(html).not.toMatch(/script|onclick|class=|data-mw/);
    expect(html).not.toContain("<li></li>");
  });

  it("returns null when there is no English section", () => {
    expect(extractEnglishDefinitions(`<h2 data-mw-anchor="Dutch">Dutch</h2><p>x</p>`)).toBeNull();
  });
});
