"use client";

import { Group, Skeleton, Text } from "@mantine/core";

/**
 * Holds the pronunciation row's place while the dictionary loads, so the Translate button, rating and
 * definition don't jump down when it arrives. Built like the row (the speaker's size, a line of the
 * respelling's text), so it's the same height.
 */
export function PronunciationPlaceholder() {
  return (
    <Group gap="sm" mb="md" wrap="nowrap" align="center" aria-hidden>
      <Skeleton height={28} width={28} radius="sm" />
      <Skeleton width={150} radius="sm">
        <Text fz="lg" fw={500}>
          &nbsp;
        </Text>
      </Skeleton>
    </Group>
  );
}
