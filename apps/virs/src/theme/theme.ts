import { createTheme } from "@mantine/core";
import { LUMINANCE_THRESHOLD } from "./luminance-threshold";
import { VIRS_COLORS } from "./virs-colors";
import { VIRS_TOKENS } from "./virs-tokens";

// Lexend was designed for reading fluency; loaded by next/font in app/layout.tsx.
const LEXEND = 'var(--font-lexend), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

/** The Mantine theme: palette, type, spacing and every component's defaults. Passed to MantineProvider. */
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
  // Mantine's own transitions (pop-ups, the drawer) follow the visitor's "reduce motion" setting.
  respectReducedMotion: true,

  other: { tokens: VIRS_TOKENS },

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
    // Size lg is 13px, the smallest text the app uses (Mantine's default badge is 11px).
    Badge: { defaultProps: { radius: "sm", variant: "light", size: "lg" }, styles: { root: { textTransform: "none", fontWeight: 600 } } },
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
