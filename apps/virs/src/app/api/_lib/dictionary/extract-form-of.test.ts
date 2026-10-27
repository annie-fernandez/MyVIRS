import { describe, expect, it } from "vitest";
import { extractFormOf } from "./extract-form-of";

const english = (senses: string) => `
<h2 data-mw-anchor="English">English</h2>
<h3 data-mw-anchor="Noun">Noun</h3>
<ol>${senses}</ol>
<h2 data-mw-anchor="French">French</h2>
<ol><li><span>plural of <span><i class="Latn mention" lang="fr">cellule</i></span></span></li></ol>`;
const mention = (word: string) => `<span><i class="Latn mention" lang="en">${word}</i></span>`;

describe("extractFormOf", () => {
  it("finds a plural whose every sense is a form of the base word", () => {
    const html = english(`<li><span>plural of ${mention("cell")}</span></li><li><span>third-person singular <span>simple present</span> indicative of ${mention("cell")}</span></li>`);
    expect(extractFormOf(html, "word")).toEqual({ base: "cell", relation: "plural", only: true });
  });

  it("names a past tense in plain words", () => {
    const html = english(`<li><span><span>simple past</span> and past participle of ${mention("photograph")}</span></li>`);
    expect(extractFormOf(html, "word")).toEqual({ base: "photograph", relation: "past", only: true });
  });

  it("isn't 'only' when the word also has meanings of its own", () => {
    const html = english(`<li><span>present participle and gerund of ${mention("run")}</span></li><li>Moving or advancing at a run. <ol><li>Of a horse.</li></ol></li>`);
    expect(extractFormOf(html, "word")).toEqual({ base: "run", relation: "ing", only: false });
  });

  it("ignores empty senses, and senses that merely mention a word", () => {
    expect(extractFormOf(english(`<li class="mw-empty-elt"></li><li><span>plural of ${mention("mouse")}</span></li>`), "mice")).toEqual({ base: "mouse", relation: "plural", only: true });
    expect(extractFormOf(english(`<li>A small rodent; see ${mention("mouse")} for more.</li>`), "mouse")).toBeNull();
  });

  it("returns null for an ordinary word", () => {
    expect(extractFormOf(english(`<li>The basic unit of a living organism.</li>`), "cell")).toBeNull();
  });

  it("ignores a plural further down the entry", () => {
    // Wiktionary's "his": a possessive first, and in a later Noun section, the plural of "hi".
    const html = `
<h2 data-mw-anchor="English">English</h2>
<h3 data-mw-anchor="Determiner">Determiner</h3>
<ol><li>Belonging to him.</li></ol>
<h3 data-mw-anchor="Noun">Noun</h3>
<ol><li><span>plural of ${mention("hi")}</span></li></ol>`;
    expect(extractFormOf(html, "his")).toBeNull();
  });

  it("finds a verb form whose Verb section comes after the noun", () => {
    // Wiktionary's "handling": the noun first, then "present participle and gerund of handle".
    const html = `
<h2 data-mw-anchor="English">English</h2>
<h3 data-mw-anchor="Noun">Noun</h3>
<ol><li>A touching, controlling, managing, with the hands.</li></ol>
<h3 data-mw-anchor="Verb">Verb</h3>
<ol><li><span>present participle and gerund of ${mention("handle")}</span></li></ol>`;
    expect(extractFormOf(html, "handling")).toEqual({ base: "handle", relation: "ing", only: false });
  });

  it("doesn't take an -s verb form from further down, which reads like a plural", () => {
    const html = `
<h2 data-mw-anchor="English">English</h2>
<h3 data-mw-anchor="Noun">Noun</h3>
<ol><li>The branch of science that studies matter and energy.</li></ol>
<h3 data-mw-anchor="Verb">Verb</h3>
<ol><li><span>third-person singular simple present indicative of ${mention("physic")}</span></li></ol>`;
    expect(extractFormOf(html, "physics")).toBeNull();
  });

  it("skips senses labelled obsolete, humorous and the like", () => {
    expect(extractFormOf(english(`<li><span>(chiefly humorous) plural of ${mention("shoop")}</span></li>`), "sheep")).toBeNull();
  });

  it("never calls a word a form of itself", () => {
    expect(extractFormOf(english(`<li><span>simple past and past participle of ${mention("read")}</span></li>`), "read")).toBeNull();
  });
});
