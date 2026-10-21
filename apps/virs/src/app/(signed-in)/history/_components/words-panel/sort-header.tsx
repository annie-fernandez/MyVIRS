"use client";

import { UnstyledButton } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import type { ReactNode } from "react";

/** A column title that sorts the table; the arrow shows the current order. */
export function SortHeader({ active, ascending, onClick, children }: { active: boolean; ascending: boolean; onClick: () => void; children: ReactNode }) {
  const Arrow = ascending ? IconArrowUp : IconArrowDown;
  return (
    <UnstyledButton onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, fontSize: "inherit" }}>
      {children}
      <Arrow size={14} style={{ visibility: active ? "visible" : "hidden" }} aria-hidden />
    </UnstyledButton>
  );
}
