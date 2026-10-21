import type { RatingValue } from "@repo/core";
import type { VirsColor } from "./virs-colors";

/**
 * The five self-ratings a student gives a word, stored as 1–5. Wording can change; the numbers can't.
 * The wording follows the Vocabulary Knowledge Scale (Paribakht & Wesche): each step is something the
 * student can or can't do with the word, not how confident they feel.
 */
export const RATING_SCALE: { value: RatingValue; label: string; color: VirsColor }[] = [
  { value: 1, label: "I've never seen it", color: "virsPink" },
  { value: 2, label: "I've seen it, but don't know what it means", color: "virsOrange" },
  { value: 3, label: "I think I know what it means", color: "virsGold" },
  { value: 4, label: "I know what it means", color: "virsBlue" },
  { value: 5, label: "I can use it in a sentence", color: "virsGreen" },
];
