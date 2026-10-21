"use client";

import { Anchor, Group, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { useSession } from "@/lib/auth/use-session";

/** Confirms that this analysis is in the signed-in user's history. Shows nothing otherwise. */
export function HistoryNote({ saved }: { saved: boolean }) {
  const user = useSession();
  if (!saved || !user) return null;
  return (
    <Group gap={6} c="dimmed">
      <IconCheck size={16} />
      <Text size="sm">
        Saved to{" "}
        <Anchor component={ShellLink} href="/history" inherit underline="always">
          your history
        </Anchor>
        .
      </Text>
    </Group>
  );
}
