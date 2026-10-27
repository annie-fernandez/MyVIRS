import { describe, expect, it } from "vitest";
import { extractPronunciation } from "./extract-pronunciation";

const english = (pronunciation: string) => `
<h2 data-mw-anchor="English">English</h2>
<h3 data-mw-anchor="Pronunciation">Pronunciation</h3>
<ul>${pronunciation}</ul>
<h3 data-mw-anchor="Noun">Noun</h3>
<ol><li>A picture. IPA: /not-this/</li></ol>
<h2 data-mw-anchor="Dutch">Dutch</h2>
<h3 data-mw-anchor="Pronunciation">Pronunciation</h3>
<ul><li>IPA<sup>(key)</sup>: <span>/dutch/</span></li></ul>`;

describe("extractPronunciation", () => {
  it("prefers the American transcription, without its narrow [variant]", () => {
    const html = english(`
      <li><span>(</span><span>UK</span><span>)</span> IPA<sup>(key)</sup>: <span>/ˈfəʊ.təˌɡɹɑːf/</span></li>
      <li><span>(</span><span>US</span><span>)</span> IPA<sup>(key)</sup>: <span>/ˈfoʊ.təˌɡɹæf/</span>, <span>[ˈfoʊ.ɾəˌɡɹæf]</span></li>`);
    expect(extractPronunciation(html)).toBe("/ˈfoʊ.təˌɡɹæf/");
  });

  it("recognizes General American, and skips an enPR respelling before the IPA", () => {
    const html = english(`
      <li>(UK, Australia) enPR: <span>rēd</span>, IPA<sup>(key)</sup>: <span>/ɹiːd/</span></li>
      <li>(General American, Canada) IPA<sup>(key)</sup>: <span>/ɹid/</span></li>`);
    expect(extractPronunciation(html)).toBe("/ɹid/");
  });

  it("falls back to a transcription with no region, never a British-only one", () => {
    expect(extractPronunciation(english(`<li>IPA<sup>(key)</sup>: <span>/sɛl/</span></li>`))).toBe("/sɛl/");
    expect(extractPronunciation(english(`<li>(Received Pronunciation) IPA<sup>(key)</sup>: <span>/ˈwɔː.tə/</span></li><li>Hyphenation: wa‧ter</li>`))).toBeNull();
  });

  it("returns null without an English pronunciation", () => {
    expect(extractPronunciation(english("<li>Hyphenation: wa‧ter</li>"))).toBeNull();
    expect(extractPronunciation(`<h2 data-mw-anchor="Dutch">Dutch</h2><ul><li>IPA: /x/</li></ul>`)).toBeNull();
  });
});
