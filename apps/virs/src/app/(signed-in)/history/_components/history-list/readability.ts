import { READING_LEVEL_LABELS, readingLevel, type HistoryItem } from "@repo/core";

/** A saved passage's score and level, e.g. "62 · Upper intermediate", or why it has none. */
export function readability(item: HistoryItem): string {
  const level = readingLevel(item.fleschReadingScore, item.wordCount);
  return level === "too-short" || level === "needs-more-sentences" ? READING_LEVEL_LABELS[level] : `${item.fleschReadingScore.toFixed(0)} · ${READING_LEVEL_LABELS[level]}`;
}
