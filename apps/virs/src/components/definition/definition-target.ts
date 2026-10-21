import type { CategoryKey } from "@/theme/category-styles";

/** The word a definition pop-up is opened for, and where it was clicked. */
export interface DefinitionTarget {
  word: string;
  category?: CategoryKey;
  /** The saved analysis the word was opened from, so a rating can point back to it. */
  analysisId?: string | null;
  /** The sentence the word was clicked in, saved with a rating. */
  context?: string | null;
}
