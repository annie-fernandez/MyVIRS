import type { WordCategory } from "@repo/core";

export type CategoryKey = WordCategory | "offList";

/**
 * How each vocabulary category is marked in results: the old site's hue for each, darkened until it
 * reads at 4.5:1 or better on its tint (the originals were as low as 1.5:1 on white).
 */
export const CATEGORY_STYLES: Record<CategoryKey, { text: string; tint: string }> = {
  k1: { text: "#4747d1", tint: "#ededfc" },
  k2: { text: "#257925", tint: "#e7f3e7" },
  k3: { text: "#c81e1e", tint: "#fdeaea" },
  awl: { text: "#856402", tint: "#f8f0d6" },
  baw: { text: "#a64c0c", tint: "#fdeee2" },
  stem: { text: "#03784a", tint: "#e0f5ea" },
  hi: { text: "#6e6e00", tint: "#f3f3d4" },
  med: { text: "#9c00ad", tint: "#f8e3fb" },
  low: { text: "#b8336a", tint: "#fde8f0" },
  offList: { text: "#5f5c58", tint: "#f1efec" },
};
