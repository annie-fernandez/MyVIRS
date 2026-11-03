import type { ComparedWord } from "./compare-ranks";
import { SHIFT_STYLES, type ShiftKind } from "./shift-styles";

/** Whether context ranks a word sooner or later than frequency alone does, by how many places, and how to say it. */
export function rankShift(word: ComparedWord) {
  const places = Math.abs(word.frequencyPlace - word.contextPlace);
  const kind: ShiftKind = word.contextPlace < word.frequencyPlace ? "sooner" : word.contextPlace > word.frequencyPlace ? "later" : "same";
  const text = kind === "same" ? "Same place" : `${places.toLocaleString()} ${places === 1 ? "place" : "places"} ${kind} by context`;
  return { kind, places, text, ...SHIFT_STYLES[kind] };
}
