"use client";

import { Tooltip, UnstyledButton } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconQuote } from "@tabler/icons-react";
import { CITATION } from "./citation";
import classes from "./site-shell.module.css";

/** Copies the study's citation, for anyone citing VIRS in their work. */
export function CitationButton({ collapsed }: { collapsed: boolean }) {
  const clipboard = useClipboard({ timeout: 2000 });
  const label = clipboard.copied ? "Citation copied" : "Copy our citation";
  const Icon = clipboard.copied ? IconCheck : IconQuote;
  return (
    <Tooltip label={label} position="right" disabled={!collapsed}>
      <UnstyledButton className={classes.menuItem} onClick={() => clipboard.copy(CITATION)} aria-label={label}>
        <Icon size={18} stroke={1.8} className={classes.menuIcon} />
        <span className={classes.label}>{label}</span>
      </UnstyledButton>
    </Tooltip>
  );
}
