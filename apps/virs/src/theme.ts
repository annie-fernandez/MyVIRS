import { colorsTuple, createTheme, isLightColor, type CSSVariablesResolver, type MantineColor } from "@mantine/core";
import type { WordCategory } from "@repo/core";

// The VIRS design system: colors, tokens and component defaults. The rules for using them are in
// apps/virs/DESIGN.md, and /style-guide shows every piece rendered. Change the look here, not in
// individual screens.

/* ───────────────────────── Palette ───────────────────────── */

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

/* ───────────────────────── Tokens ───────────────────────── */

/** Surface, border and layout values shared by the shell and every screen. Also exposed as CSS variables. */
export const VIRS_TOKENS = {
  /** The light neutral gray behind page content, so white cards read as sheets of paper on a desk. */
  page: "#f1f2f5",
  /** Cards, inputs, sidebar and footer: paper white. */
  surface: "#ffffff",
  /** Hairlines between surfaces. */
  border: "#d9dce3",
  /** Body text: ink, nearly black. */
  text: "#17191e",
  /** Secondary text people still need to read (Mantine's default "dimmed" is too faint). */
  textMuted: "#555a64",
  /** The header bar: the site's indigo, one shade deeper than the buttons. The only solid block of color. */
  header: "#313e89",
  /** The site name, icons and buttons on the header bar. */
  onHeader: "#ffffff",
  /** The sidebar and footer. */
  frame: "#ffffff",
  /** Text and icons on the sidebar and footer. */
  frameText: "#17191e",
  /** Quieter text there: section labels, footer links, resting icons. */
  frameMuted: "#555a64",
  /** The hover fill of links and buttons on the sidebar and footer. */
  frameBorder: "rgba(23, 25, 30, 0.06)",
  /** The fill behind the current page in the sidebar: an indigo tint. */
  frameActive: "#e4e8f8",
  /** Highlighter-pen yellow behind a key word in a page title. */
  marker: "rgba(255, 214, 0, 0.6)",
  /** Width of the page column. */
  contentWidth: "960px",
} as const;

/* ───────────────────────── Word categories ───────────────────────── */

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

/* ───────────────────────── Word ratings ───────────────────────── */

export type RatingValue = 1 | 2 | 3 | 4 | 5;

/** The five self-ratings a student gives a word, stored as 1–5. Wording can change; the numbers can't. */
export const RATING_SCALE: { value: RatingValue; label: string; color: VirsColor }[] = [
  { value: 1, label: "Never seen it", color: "virsPink" },
  { value: 2, label: "Slightly familiar", color: "virsOrange" },
  { value: 3, label: "I know it", color: "virsGold" },
  { value: 4, label: "I really know it", color: "virsBlue" },
  { value: 5, label: "I'm super confident", color: "virsGreen" },
];

/* ───────────────────────── Helpers ───────────────────────── */

// Colors lighter than this get dark text instead of white. The old site's white text on cyan,
// green and orange was 1.8–3.0:1; this threshold fixes that across every filled component.
const LUMINANCE_THRESHOLD = 0.28;

/** Readable text color for content placed on a block of the given palette color (shade 6). */
export function textOn(color: VirsColor): string {
  return isLightColor(VIRS_COLORS[color][6], LUMINANCE_THRESHOLD) ? VIRS_TOKENS.text : "#ffffff";
}

/** CSS variables that tint a block in a palette color; consumed by the components in components/ui. */
export function tintVars(color: VirsColor | MantineColor): Record<string, string> {
  return {
    "--tint-color": `var(--mantine-color-${color}-6)`,
    // The same hue dark enough for text and thin icons on white (shade 6 of green or gold isn't).
    "--tint-strong": `var(--mantine-color-${color}-8)`,
    "--tint-bg": `var(--mantine-color-${color}-0)`,
    "--tint-border": `var(--mantine-color-${color}-2)`,
  };
}

/* ───────────────────────── Theme ───────────────────────── */

const EUROPA = 'europa, "Avenir Next", "Century Gothic", system-ui, sans-serif';
// Lexend was designed for reading fluency; loaded by next/font in app/layout.tsx.
const LEXEND = 'var(--font-lexend), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export const theme = createTheme({
  colors: VIRS_COLORS,
  primaryColor: "virsIndigo",
  primaryShade: 6,
  autoContrast: true,
  luminanceThreshold: LUMINANCE_THRESHOLD,
  black: VIRS_TOKENS.text,
  white: VIRS_TOKENS.surface,

  fontFamily: LEXEND,
  fontFamilyMonospace: 'ui-monospace, "SF Mono", Menlo, monospace',
  fontSizes: { xs: "0.8125rem", sm: "0.875rem", md: "1rem", lg: "1.125rem", xl: "1.3125rem" },
  lineHeights: { xs: "1.4", sm: "1.5", md: "1.6", lg: "1.6", xl: "1.5" },
  headings: {
    fontFamily: LEXEND,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.875rem", lineHeight: "1.2" },
      h2: { fontSize: "1.375rem", lineHeight: "1.3" },
      h3: { fontSize: "1.1875rem", lineHeight: "1.35" },
      h4: { fontSize: "1.0625rem", lineHeight: "1.4" },
      h5: { fontSize: "1rem", lineHeight: "1.45" },
      h6: { fontSize: "0.875rem", lineHeight: "1.5" },
    },
  },

  spacing: { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" },
  defaultRadius: "md",
  radius: { xs: "4px", sm: "6px", md: "8px", lg: "10px", xl: "14px" },
  shadows: {
    xs: "0 1px 2px rgba(42, 42, 42, 0.05)",
    sm: "0 1px 2px rgba(42, 42, 42, 0.06)",
    md: "0 4px 12px -4px rgba(42, 42, 42, 0.10)",
    lg: "0 10px 24px -10px rgba(42, 42, 42, 0.16)",
    xl: "0 18px 40px -16px rgba(42, 42, 42, 0.22)",
  },
  cursorType: "pointer",

  other: { europa: EUROPA, tokens: VIRS_TOKENS },

  // Defaults for every Mantine component the app uses, so screens get the house style without
  // passing props, and only pass what is genuinely different on that screen.
  components: {
    // Actions
    Button: { defaultProps: { radius: "md" }, styles: { root: { fontWeight: 600 } } },
    ActionIcon: { defaultProps: { radius: "md", variant: "subtle", color: "charcoal" } },
    CloseButton: { defaultProps: { radius: "md" } },
    Anchor: { defaultProps: { underline: "hover" } },

    // Inputs: one radius, medium-weight labels, help text and errors below the field.
    InputWrapper: {
      defaultProps: { inputWrapperOrder: ["label", "input", "description", "error"] },
      styles: { label: { fontWeight: 500, marginBottom: 4 }, description: { marginTop: 4 } },
    },
    Input: { defaultProps: { radius: "md" } },
    TextInput: { defaultProps: { radius: "md" } },
    PasswordInput: { defaultProps: { radius: "md" } },
    Textarea: { defaultProps: { radius: "md" } },
    NumberInput: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md", checkIconPosition: "right", allowDeselect: false } },
    MultiSelect: { defaultProps: { radius: "md", checkIconPosition: "right" } },
    Autocomplete: { defaultProps: { radius: "md" } },
    FileInput: { defaultProps: { radius: "md", clearable: true } },
    Checkbox: { defaultProps: { radius: "sm" } },
    Switch: { defaultProps: { color: "virsIndigo" } },
    // White track with a hairline, so the whole switcher is visible on the gray page (Mantine's gray
    // track disappears into it).
    SegmentedControl: {
      defaultProps: { radius: "md", color: "virsIndigo" },
      styles: { root: { backgroundColor: VIRS_TOKENS.surface, border: `1px solid ${VIRS_TOKENS.border}` } },
    },
    Chip: { defaultProps: { radius: "md", variant: "light" } },

    // Surfaces
    Paper: { defaultProps: { radius: "lg" } },
    Card: { defaultProps: { radius: "lg", withBorder: true, padding: "lg" }, styles: { root: { borderColor: VIRS_TOKENS.border } } },
    Divider: { styles: { root: { borderColor: VIRS_TOKENS.border } } },
    Accordion: { defaultProps: { radius: "lg", variant: "separated", chevronPosition: "right" } },
    Tabs: { defaultProps: { radius: "md", color: "virsIndigo" } },

    // Feedback
    Alert: { defaultProps: { radius: "md", variant: "light" } },
    Notification: { defaultProps: { radius: "md" } },
    Loader: { defaultProps: { type: "dots", color: "virsOrange" } },
    Progress: { defaultProps: { radius: "xl", size: "sm", color: "virsIndigo" } },
    Skeleton: { defaultProps: { radius: "md" } },

    // Overlays
    // Pop-ups dim the page behind them and nothing else: a slight blur read as a smear, not as depth.
    // Their titles are set like the app's other headings (Mantine's default is plain body text).
    Modal: {
      defaultProps: { radius: "lg", centered: true, overlayProps: { backgroundOpacity: 0.6 } },
      styles: { title: { fontWeight: 600, fontSize: "1.1875rem", lineHeight: 1.35 } },
    },
    Drawer: { defaultProps: { overlayProps: { backgroundOpacity: 0.6 } }, styles: { title: { fontWeight: 600, fontSize: "1.1875rem", lineHeight: 1.35 } } },
    Menu: { defaultProps: { radius: "md", shadow: "md", withinPortal: true } },
    Popover: { defaultProps: { radius: "md", shadow: "md", withinPortal: true } },
    HoverCard: { defaultProps: { radius: "md", shadow: "md", withinPortal: true } },
    Tooltip: { defaultProps: { radius: "sm", withArrow: true, openDelay: 300 } },

    // Data display
    Badge: { defaultProps: { radius: "sm", variant: "light" }, styles: { root: { textTransform: "none", fontWeight: 600 } } },
    ThemeIcon: { defaultProps: { radius: "md" } },
    Avatar: { defaultProps: { radius: "xl", color: "virsOrange" } },
    Table: {
      defaultProps: { verticalSpacing: "sm", horizontalSpacing: "md", striped: true, highlightOnHover: true },
      styles: { th: { fontWeight: 600 } },
    },
    Pagination: { defaultProps: { radius: "md", color: "virsIndigo" } },
    Stepper: { defaultProps: { color: "virsIndigo", size: "sm" } },
  },
});

/** CSS variables for the tokens, plus a readable "dimmed" color. Passed to MantineProvider. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--virs-page": VIRS_TOKENS.page,
    "--virs-surface": VIRS_TOKENS.surface,
    "--virs-border": VIRS_TOKENS.border,
    "--virs-text": VIRS_TOKENS.text,
    "--virs-text-muted": VIRS_TOKENS.textMuted,
    "--virs-frame": VIRS_TOKENS.frame,
    "--virs-frame-text": VIRS_TOKENS.frameText,
    "--virs-frame-muted": VIRS_TOKENS.frameMuted,
    "--virs-frame-border": VIRS_TOKENS.frameBorder,
    "--virs-frame-active": VIRS_TOKENS.frameActive,
    "--virs-header": VIRS_TOKENS.header,
    "--virs-on-header": VIRS_TOKENS.onHeader,
    "--virs-marker": VIRS_TOKENS.marker,
    "--virs-content-width": VIRS_TOKENS.contentWidth,
    "--virs-europa": EUROPA,
  },
  light: { "--mantine-color-dimmed": VIRS_TOKENS.textMuted },
  dark: {},
});
