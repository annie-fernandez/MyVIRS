import { useState } from "react";
import type { DefinitionTarget } from "./definition-target";

/**
 * The words opened from inside a definition (running → run), so the panel can show the latest and go
 * back one at a time. Opening a new word from the passage or list starts a new trail.
 */
export function useWordTrail(target: DefinitionTarget | null) {
  const [trail, setTrail] = useState<DefinitionTarget[]>([]);
  const [lastTarget, setLastTarget] = useState(target);
  // React's pattern for resetting state when a prop changes, without an effect.
  if (target !== lastTarget) {
    setLastTarget(target);
    setTrail([]);
  }

  const shown = trail.at(-1) ?? target;
  const previous = trail.length ? (trail.at(-2) ?? target) : null;
  return {
    /** The word to show now. */
    shown,
    /** The word "Back" returns to, or null at the start of the trail. */
    previous,
    // The base word keeps the sentence and analysis it was reached from, for its rating; not the
    // clicked word's list, which may not be the base word's.
    open: (word: string) => shown && setTrail([...trail, { word, analysisId: shown.analysisId, context: shown.context }]),
    back: () => setTrail(trail.slice(0, -1)),
  };
}
