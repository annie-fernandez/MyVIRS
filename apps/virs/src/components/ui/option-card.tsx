"use client";

import { Box, Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { IconArrowRight, type Icon } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { tintVars } from "@/theme/tint-vars";
import type { VirsColor } from "@/theme/virs-colors";
import classes from "./option-card.module.css";

interface OptionCardProps {
  href: string;
  color: VirsColor;
  icon: Icon;
  title: ReactNode;
  description?: ReactNode;
  /** Smaller padding and icon, for three or more side by side. */
  compact?: boolean;
}

/** A link to a choice (a way to add text, a tool), with its color on the icon. Use in grids of options. */
export function OptionCard({ href, color, icon: IconComponent, title, description, compact = false }: OptionCardProps) {
  return (
    <UnstyledButton
      component={ShellLink}
      href={href}
      className={classes.optionCard}
      data-compact={compact || undefined}
      style={tintVars(color) as CSSProperties}
    >
      <Group wrap="nowrap" gap={compact ? "sm" : "md"}>
        <ThemeIcon size={compact ? 36 : 48} className={classes.optionIcon}>
          <IconComponent size={compact ? 20 : 24} stroke={1.8} />
        </ThemeIcon>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} fz={compact ? "md" : "lg"}>
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
        <IconArrowRight size={18} className={classes.optionArrow} />
      </Group>
    </UnstyledButton>
  );
}
