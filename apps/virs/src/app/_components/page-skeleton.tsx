"use client";

import { Skeleton, Stack, VisuallyHidden } from "@mantine/core";
import { Surface } from "@/components/ui/surface";

/**
 * What a screen shows while the server prepares it: the shape every screen has (title, description,
 * main panel), so the real one fills in where its placeholder was instead of the page jumping.
 */
export function PageSkeleton() {
  return (
    <Stack gap="xl" aria-busy="true">
      <VisuallyHidden role="status">Loading the page…</VisuallyHidden>
      <Stack gap={12}>
        <Skeleton height={36} width={320} maw="100%" radius="md" />
        <Skeleton height={18} width={560} maw="100%" radius="sm" />
      </Stack>
      <Surface>
        <Skeleton height={220} radius="md" />
      </Surface>
    </Stack>
  );
}
