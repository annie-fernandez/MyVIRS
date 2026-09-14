"use client";

import { Avatar, Button, Group, Menu, Skeleton, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <Skeleton height={34} width={96} radius="md" />;

  if (!session) {
    return (
      <Group gap="xs" wrap="nowrap">
        <Button component={Link} href="/sign-in" variant="default">
          Sign in
        </Button>
        <Button component={Link} href="/sign-up" visibleFrom="xs">
          Create account
        </Button>
      </Group>
    );
  }

  const { user } = session;
  const firstName = user.name.split(" ")[0];

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Menu position="bottom-end" width={220} withArrow>
      <Menu.Target>
        <UnstyledButton aria-label="Account menu">
          <Group gap={8} wrap="nowrap">
            <Avatar name={user.name} color="initials" radius="xl" size={32} />
            <Text size="sm" fw={600} visibleFrom="sm">
              {firstName}
            </Text>
            <IconChevronDown size={14} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          {user.name}
          <Text size="xs" c="dimmed" truncate>
            @{user.displayUsername ?? user.username}
          </Text>
        </Menu.Label>
        <Menu.Item component={Link} href="/account" leftSection={<IconUser size={16} />}>
          My account
        </Menu.Item>
        {user.role === "admin" && (
          <Menu.Item component={Link} href="/admin/words" leftSection={<IconSettings size={16} />}>
            Manage words
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={signOut}>
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
