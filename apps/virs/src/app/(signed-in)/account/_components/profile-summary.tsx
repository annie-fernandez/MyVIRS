"use client";

import { Avatar, Badge, Box, Group, Text, Title } from "@mantine/core";
import { useRequiredUser } from "@/lib/auth/use-required-user";
import { getInitials } from "@/lib/get-initials";

/** The top of the profile card, above its tabs: who's signed in, at a glance. */
export function ProfileSummary() {
  const user = useRequiredUser();
  return (
    <Group gap="md" wrap="nowrap">
      <Avatar size={64} radius="xl" color="virsOrange" variant="filled" fz="xl">
        {getInitials(user.name)}
      </Avatar>
      <Box miw={0}>
        <Title order={2} fz="xl" style={{ overflowWrap: "anywhere" }}>
          {user.name}
        </Title>
        <Text size="sm" c="dimmed" style={{ overflowWrap: "anywhere" }}>
          @{user.username} · {user.email}
        </Text>
        <Group gap="xs" mt={6}>
          {user.userLevel && <Badge color="virsIndigo">{user.userLevel}</Badge>}
          <Text size="sm" c="dimmed">
            Member since {new Date(user.createdAt).toLocaleDateString([], { dateStyle: "long" })}
          </Text>
        </Group>
      </Box>
    </Group>
  );
}
