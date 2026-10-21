"use client";

import { Text, UnstyledButton } from "@mantine/core";
import classes from "./stat-tile.module.css";

/** A headline number that opens what it counts. */
export function StatTile({ label, value, hint, onClick }: { label: string; value: number; hint: string; onClick: () => void }) {
  return (
    <UnstyledButton onClick={onClick} className={classes.statTile}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text fw={600} fz={28} lh={1.2}>
        {value.toLocaleString()}
      </Text>
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    </UnstyledButton>
  );
}
