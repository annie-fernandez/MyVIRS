"use client";

import { Box, Group, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./page-header.module.css";

interface PageHeaderProps {
  /** Short orange line above the title, e.g. the site tagline on Home. Optional. */
  eyebrow?: ReactNode;
  /** The page title. Wrap one key word in <Marker>. */
  title: ReactNode;
  /** One or two sentences saying what the page does. */
  description?: ReactNode;
  /** The page's main action(s), shown under the description. */
  actions?: ReactNode;
  /** Height kept for the description: 2 lines by default so panels line up across screens; 1 for a one-line one. */
  descriptionLines?: 1 | 2;
}

/** The top of every screen: optional eyebrow, the title, a short description and the main action. */
export function PageHeader({ eyebrow, title, description, actions, descriptionLines = 2 }: PageHeaderProps) {
  return (
    <Box>
      {eyebrow && (
        <Text className={classes.eyebrow} fw={600} size="sm" mb={6}>
          {eyebrow}
        </Text>
      )}
      <Title order={1} mb={description ? 8 : 0}>
        {title}
      </Title>
      {description && (
        <Text c="dimmed" fz="lg" maw={640} className={descriptionLines === 2 ? classes.lead : undefined}>
          {description}
        </Text>
      )}
      {actions && (
        <Group gap="sm" mt="lg">
          {actions}
        </Group>
      )}
    </Box>
  );
}
