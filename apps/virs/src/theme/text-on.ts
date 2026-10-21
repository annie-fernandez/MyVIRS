import { isLightColor } from "@mantine/core";
import { LUMINANCE_THRESHOLD } from "./luminance-threshold";
import { VIRS_COLORS, type VirsColor } from "./virs-colors";
import { VIRS_TOKENS } from "./virs-tokens";

/** Readable text color for content placed on a block of the given palette color (shade 6). */
export function textOn(color: VirsColor): string {
  return isLightColor(VIRS_COLORS[color][6], LUMINANCE_THRESHOLD) ? VIRS_TOKENS.text : "#ffffff";
}
