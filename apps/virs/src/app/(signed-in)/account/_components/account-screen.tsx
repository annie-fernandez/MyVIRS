"use client";

import { Box, Group, Stack, Tabs, Text } from "@mantine/core";
import { IconLock, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { PasswordForm } from "../../_components/password-form";
import classes from "./account-screen.module.css";
import { DeleteAccount } from "./delete-account";
import { ProfileForm } from "./profile-form";
import { ProfileSummary } from "./profile-summary";

// Deleting the account is underlined in red when chosen: red marks destructive actions (DESIGN.md).
const TABS = [
  { value: "details", label: "Your details", icon: IconUserCircle, color: undefined },
  { value: "password", label: "Password", icon: IconLock, color: undefined },
  { value: "delete", label: "Delete account", icon: IconTrash, color: "red" },
] as const;

/**
 * The signed-in user's profile: one card, with who you are at the top and a tab for each part of the
 * account, so only one form shows at a time and the page doesn't scroll. Deleting the account has a
 * tab of its own, so it never sits next to a routine save.
 */
export function AccountScreen() {
  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            My <Marker>profile</Marker>
          </>
        }
        description="Update your details and your password, or delete your account."
        descriptionLines={1}
      />
      {/* Forms stay compact rather than stretching across a wide screen (DESIGN.md, Layout). */}
      <Surface maw={720} p={{ base: "md", sm: "lg" }}>
        <ProfileSummary />
        <Tabs defaultValue="details" mt="lg">
          {/* The same tabs as the Analyze panel: equal widths across the card, icons from tablets up. */}
          <Tabs.List grow mb="lg" style={{ flexWrap: "nowrap" }} aria-label="Your account">
            {TABS.map(({ value, label, icon: TabIcon, color }) => (
              <Tabs.Tab key={value} value={value} color={color} px={{ base: 4, sm: "md" }} className={classes.tab}>
                <Group gap={8} justify="center" wrap="nowrap">
                  <Box component="span" visibleFrom="sm" lh={0}>
                    <TabIcon size={18} stroke={1.8} />
                  </Box>
                  {label}
                </Group>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="details">
            <ProfileForm />
          </Tabs.Panel>
          <Tabs.Panel value="password">
            <Text size="sm" c="dimmed" mb="md">
              Changing your password signs you out on your other devices.
            </Text>
            <PasswordForm />
          </Tabs.Panel>
          <Tabs.Panel value="delete">
            <Text size="sm" c="dimmed" mb="md">
              Removes your account, along with your history and word ratings. This can&apos;t be undone.
            </Text>
            <DeleteAccount />
          </Tabs.Panel>
        </Tabs>
      </Surface>
    </Stack>
  );
}
