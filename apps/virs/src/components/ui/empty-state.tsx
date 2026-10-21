"use client";

import { Box, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";
import classes from "./empty-state.module.css";

interface EmptyStateProps {
  icon: Icon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** What a list or panel shows before there is anything in it. Always says what to do next. */
export function EmptyState({ icon: IconComponent, title, description, action }: EmptyStateProps) {
  return (
    <Box className={classes.emptyState}>
      <ThemeIcon size={44} variant="light" color="virsOrange" mx="auto" mb="sm">
        <IconComponent size={22} stroke={1.8} />
      </ThemeIcon>
      <Text fw={600}>{title}</Text>
      {description && (
        <Text size="sm" c="dimmed" maw={420} mx="auto" mt={4}>
          {description}
        </Text>
      )}
      {action && <Box mt="md">{action}</Box>}
    </Box>
  );
}
