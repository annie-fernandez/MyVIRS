import type { CSSVariablesResolver } from "@mantine/core";
import { EUROPA } from "./europa";
import { VIRS_TOKENS } from "./virs-tokens";

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
    "--virs-menu": VIRS_TOKENS.menu,
    "--virs-on-menu": VIRS_TOKENS.onMenu,
    "--virs-menu-muted": VIRS_TOKENS.menuMuted,
    "--virs-menu-hover": VIRS_TOKENS.menuHover,
    "--virs-marker": VIRS_TOKENS.marker,
    "--virs-europa": EUROPA,
  },
  light: { "--mantine-color-dimmed": VIRS_TOKENS.textMuted },
  dark: {},
});
