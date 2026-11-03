export type ShiftKind = "sooner" | "later" | "same";

/**
 * How a word's place moves from frequency to context. Blue and orange (shade 8) stay apart for
 * colorblind readers; the gray is the neutral middle. Each is always shown with its words too.
 */
export const SHIFT_STYLES: Record<ShiftKind, { label: string; color: string; cssColor: string }> = {
  sooner: { label: "Sooner by context", color: "virsBlue.8", cssColor: "var(--mantine-color-virsBlue-8)" },
  later: { label: "Later by context", color: "virsOrange.8", cssColor: "var(--mantine-color-virsOrange-8)" },
  same: { label: "Same place", color: "charcoal.4", cssColor: "var(--mantine-color-charcoal-4)" },
};
