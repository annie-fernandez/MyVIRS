/**
 * Fixed passages for the analyzer regression baseline.
 *
 * These are chosen to pin specific documented behaviors, not to read like realistic prose. Each
 * one exists so that a change to tokenizing, lookup order, categorization or readability shows up
 * as a failing test rather than as a surprise in production.
 *
 * Editing a passage invalidates the recorded baseline. If you change one, regenerate deliberately:
 *   pnpm --filter @repo/db db:build-regression-baseline
 * and review the resulting diff to `baseline.json` as part of the change.
 */
export interface RegressionPassage {
  id: string;
  /** What this passage is here to detect if it breaks. */
  pins: string;
  text: string;
}

export const REGRESSION_PASSAGES: readonly RegressionPassage[] = [
  {
    id: "paragraphs",
    pins:
      "Paragraph breaks come from blank lines only. The legacy app also broke on a double space, " +
      "so the two spaces after 'mat.' must NOT produce a paragraph marker.",
    text: "The cat sat on the mat.  Then it slept by the warm fire.\n\nA second paragraph begins here, after a blank line.",
  },
  {
    id: "as-written-before-singular",
    pins:
      "A token is looked up exactly as written before its singular form. 'data' and 'analyses' " +
      "must not be silently rewritten to 'datum' or 'analysis' when the plural is itself listed.",
    text: "The children analyzed the data carefully. Their analyses were thorough and their conclusions consistent.",
  },
  {
    id: "punctuation-and-hyphens",
    pins:
      "Punctuation is stripped before lookup, so hyphenated list entries match. Also covers the " +
      "hyphen merge: 'non-essential' resolves to the merged 'nonessential' entry.",
    text: 'A co-worker made a non-essential request — "well-meant," she said, but poorly timed.',
  },
  {
    id: "academic-and-basic-academic",
    pins:
      "Academic Word List and Basic Academic Word matches are both counted in the statistics. " +
      "The legacy app silently dropped baw from the totals.",
    text: "Research indicates that significant analysis requires adequate data. The method must remain consistent throughout.",
  },
  {
    id: "readability-and-sentences",
    pins: "Sentence counting and the Flesch reading-ease score across sentences of varied length.",
    text: "Photosynthesis converts light into chemical energy. Plants need it. Without sufficient sunlight, growth slows and eventually stops altogether.",
  },
  {
    id: "off-list-and-names",
    pins:
      "Proper nouns and unlisted words fall through to offList rather than being dropped, so the " +
      "category totals still reconcile with the overall word count.",
    text: "Reykjavik chilled Bjorn thoroughly. The zyzzyva beetle eluded every entomologist who searched.",
  },
  {
    id: "readability-long",
    pins:
      "The Flesch calculation itself. fleschReadingEase returns 0 below MIN_WORDS_FOR_READABILITY " +
      "(100 words), which every shorter passage here hits — so without a passage over that floor the " +
      "score, the syllable counting and the averages would all go unchecked.",
    text:
      "Reading widely is the most reliable way to build a large vocabulary. When a student meets an " +
      "unfamiliar word inside a sentence, the surrounding words often suggest its meaning, and that " +
      "guess becomes easier to remember than a definition copied from a list. Teachers have known this " +
      "for a long time. The difficulty is that useful words appear rarely, so a reader must cover a " +
      "great deal of text before meeting them often enough to retain them. This is why word lists " +
      "matter. A list tells a teacher which words repay direct attention and which will arrive on their " +
      "own through ordinary reading. The lists in this study group words by how frequently they occur, " +
      "from the most common thousand through the academic vocabulary that university courses assume " +
      "every student already understands.",
  },
  {
    id: "empty-ish",
    pins: "Degenerate input: punctuation and whitespace only must not crash or divide by zero.",
    text: "...   \n\n  ???  ",
  },
] as const;
