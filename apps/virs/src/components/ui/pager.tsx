"use client";

import { ActionIcon, Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import classes from "./pager.module.css";

/**
 * "‹ 1 of 3 ›" under a paged list: back, where you are, forward. Used instead of numbered page
 * buttons, which looked too much like the 1–5 rating squares.
 */
export function Pager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  if (total <= 1) return null;
  return (
    <Group gap={4} wrap="nowrap" component="nav" aria-label="Pages">
      <ActionIcon variant="subtle" color="charcoal" className={classes.pagerArrow} aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <IconChevronLeft size={18} />
      </ActionIcon>
      <Text size="sm" miw={56} ta="center" aria-live="polite">
        {page} of {total}
      </Text>
      <ActionIcon variant="subtle" color="charcoal" className={classes.pagerArrow} aria-label="Next page" disabled={page >= total} onClick={() => onChange(page + 1)}>
        <IconChevronRight size={18} />
      </ActionIcon>
    </Group>
  );
}
