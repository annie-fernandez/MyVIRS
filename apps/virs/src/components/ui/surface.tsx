"use client";

import { Paper, type PaperProps } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./surface.module.css";

/** A white card on the gray page: the screen's main panel (its input or result) and any other card. */
export function Surface({ children, className, ...props }: { children: ReactNode } & PaperProps) {
  return (
    <Paper p="lg" {...props} className={className ? `${classes.surface} ${className}` : classes.surface}>
      {children}
    </Paper>
  );
}
