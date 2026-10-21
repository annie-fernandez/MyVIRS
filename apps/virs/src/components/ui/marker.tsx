"use client";

import type { CSSProperties, ReactNode } from "react";
import type { VirsColor } from "@/theme/virs-colors";
import classes from "./marker.module.css";

/**
 * Highlighter stroke behind one key word of a page title. One per title, at most. Yellow unless the
 * screen has its own color (the Word document screen is cyan, the PDF screen green), which is how
 * each screen shows its color.
 */
export function Marker({ children, color }: { children: ReactNode; color?: VirsColor }) {
  return (
    <span className={classes.marker} style={color ? ({ "--marker-color": `var(--mantine-color-${color}-3)` } as CSSProperties) : undefined}>
      {children}
    </span>
  );
}
