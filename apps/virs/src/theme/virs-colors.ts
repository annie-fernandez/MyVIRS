import { colorsTuple } from "@mantine/core";

// The VIRS design system lives in this folder: colors, tokens and component defaults. The rules for
// using them are in apps/virs/DESIGN.md, and /style-guide shows every piece rendered. Change the look
// here, not in individual screens.

// Sampled from the original Angular site so the app keeps its character. Shade 6 is the original
// value (the shade filled components use); the others are tints and shades of it.
export const VIRS_COLORS = {
  virsIndigo: colorsTuple(["#f0f1f9", "#dde0f2", "#c2c8e7", "#a4acdb", "#8590cf", "#6371c2", "#4152b4", "#39489e", "#313e89", "#2a3473"]),
  virsCyan: colorsTuple(["#ebfafb", "#d1f3f7", "#ade9f1", "#85deea", "#5cd3e3", "#2ec7db", "#00bbd3", "#00a5ba", "#008ea0", "#007887"]),
  virsGreen: colorsTuple(["#f4fcf0", "#e6f8dd", "#d3f3c2", "#bceda4", "#a6e785", "#8de063", "#74d941", "#66bf39", "#58a531", "#4a8b2a"]),
  virsPink: colorsTuple(["#ffebf4", "#ffd1e6", "#ffadd2", "#ff85bb", "#ff5ca5", "#ff2e8b", "#ff0072", "#e00064", "#c20057", "#a30049"]),
  virsOrange: colorsTuple(["#fff4ed", "#ffe7d6", "#ffd4b5", "#ffbf91", "#ffa96c", "#ff9142", "#ff7919", "#e06a16", "#c25c13", "#a34d10"]),
  virsBlue: colorsTuple(["#eff7fe", "#dcedfd", "#c1defc", "#a2cefa", "#83bef9", "#60abf7", "#3d99f5", "#3687d8", "#2e74ba", "#27629d"]),
  // The gold in the middle of the header gradient. Used for the middle of the rating scale.
  virsGold: colorsTuple(["#fdf7ea", "#f9ebcc", "#f3d99c", "#ecc56a", "#e3b03f", "#d79b1c", "#c98303", "#b07303", "#966202", "#7c5102"]),
  charcoal: colorsTuple(["#f4f3f1", "#e4e2df", "#c9c6c2", "#a29f9b", "#7d7a76", "#5a5855", "#3d3d3d", "#333333", "#2a2a2a", "#212121"]),
};

export type VirsColor = keyof typeof VIRS_COLORS;
