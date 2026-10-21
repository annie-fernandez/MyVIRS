"use client";

import { Tooltip } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import { categoryLabel } from "@/lib/categories/category-label";
import { CATEGORY_STYLES, type CategoryKey } from "@/theme/category-styles";
import classes from "./word-tag.module.css";

interface WordTagProps {
  category: CategoryKey;
  children: ReactNode;
  /** Makes the word a button, e.g. to open its definition. */
  onClick?: () => void;
  /** Shows the word without its category color, e.g. when that category's highlight is turned off. */
  plain?: boolean;
  /** "inline" colors only the text, for words inside a passage; "chip" adds the tint, for words on their own. */
  variant?: "inline" | "chip";
}

/** A word marked in its vocabulary category's color. The tooltip names the category. */
export function WordTag({ category, children, onClick, plain = false, variant = "chip" }: WordTagProps) {
  const style = CATEGORY_STYLES[category];
  const tint = { "--word-tint": style.tint } as CSSProperties;
  const colors = plain ? tint : variant === "chip" ? { ...tint, color: style.text, background: style.tint } : { ...tint, color: style.text };
  if (onClick) {
    return (
      <button type="button" className={classes.wordTag} data-plain={plain || undefined} data-variant={variant} data-clickable style={colors} title={categoryLabel(category)} onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <Tooltip label={categoryLabel(category)}>
      <span className={classes.wordTag} data-plain={plain || undefined} data-variant={variant} style={colors}>
        {children}
      </span>
    </Tooltip>
  );
}
