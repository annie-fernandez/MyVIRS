"use client";

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
      onClick={() => setColorScheme(computed === "light" ? "dark" : "light")}
    >
      <IconSun size={18} stroke={1.6} display={computed === "dark" ? "block" : "none"} />
      <IconMoon size={18} stroke={1.6} display={computed === "light" ? "block" : "none"} />
    </ActionIcon>
  );
}
