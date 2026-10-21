"use client";

import { Box, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

/** A titled group of content within a screen. */
export function Section({ title, description, children }: { title: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <Stack gap="sm" component="section">
      <Box>
        <Title order={2} fz="lg">
          {title}
        </Title>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Stack>
  );
}
