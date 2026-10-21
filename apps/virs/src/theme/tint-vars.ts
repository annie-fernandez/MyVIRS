import type { MantineColor } from "@mantine/core";
import type { VirsColor } from "./virs-colors";

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
