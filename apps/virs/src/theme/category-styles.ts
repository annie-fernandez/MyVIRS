import type { WordCategory } from "@repo/core";

export type CategoryKey = WordCategory | "offList";

/**
 * How each vocabulary category is marked in results, from the sprint card: K1 blue, K2 green,
 * Academic yellow, Low red, the other lists in reds, maroons and pinks, and off-list words black.
 * Each text color reads at 4.5:1 or better on white and on its tint, so Academic is a dark yellow:
 * a brighter one can't be read on white.
 */
export const CATEGORY_STYLES: Record<CategoryKey, { text: string; tint: string }> = {
  k1: { text: "#1f5fbf", tint: "#e8f0fc" },
  k2: { text: "#257925", tint: "#e7f3e7" },
  k3: { text: "#a3203f", tint: "#fbe7ec" },
  awl: { text: "#7a6500", tint: "#fbf1bf" },
  baw: { text: "#9a2c5e", tint: "#f8e5ee" },
  stem: { text: "#a1197f", tint: "#f9e3f3" },
  hi: { text: "#7b1f35", tint: "#f5e4e8" },
  med: { text: "#c0246a", tint: "#fde6f0" },
  low: { text: "#c81e1e", tint: "#fdeaea" },
  offList: { text: "#1f1f1f", tint: "#ececec" },
};
