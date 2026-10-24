"use client";

import { Avatar, Box, Button, Group, Menu, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconChevronRight, IconLock, IconLogin, IconLogout, IconUserCircle } from "@tabler/icons-react";
import { useState } from "react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { useSession } from "@/lib/auth/use-session";
import { useSessionChanged } from "@/lib/auth/use-session-changed";
import { useSignOut } from "@/lib/auth/use-sign-out";
import { getInitials } from "@/lib/get-initials";
import type { AccountFormView } from "../../account-forms/account-form-view";
import { AccountModal } from "../../account-forms/account-modal";
import classes from "../site-shell.module.css";
import { ACCOUNT_LINKS } from "./account-links";

/**
 * The account control at the bottom of the side menu: a Log in button that opens the account
 * pop-up, or the signed-in user's menu. Collapsed, both shrink to an icon with a tooltip.
 */
export function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const user = useSession();
  const signOut = useSignOut();
  const sessionChanged = useSessionChanged();
  const [view, setView] = useState<AccountFormView | null>(null);

  return (
    <>
      {user ? (
        // Signed in: the menu holds the account itself (profile, password, log out). What the user
        // has made (their history) is a destination in the menu above, not in here.
        <Menu position="right-end" width={264} offset={12}>
          <Menu.Target>
            <Tooltip label={user.name} position="right" disabled={!collapsed}>
              <UnstyledButton className={classes.menuItem} aria-label={`Your account: ${user.name}`}>
                {/* 24px, wider than the 18px icons: pulled in 3px each side so it lines up with them. */}
                <Avatar size={24} mx={-3} radius="xl" color="virsOrange" variant="filled" fz={11}>
                  {getInitials(user.name)}
                </Avatar>
                <span className={classes.label}>{user.name}</span>
                <IconChevronRight size={14} className={classes.menuChevron} />
              </UnstyledButton>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            {/* Who's signed in, as a card at the top (Mantine's user-menu pattern): name, then email. */}
            <Group gap="sm" wrap="nowrap" px="sm" py="xs">
              <Avatar size={40} radius="xl" color="virsOrange" variant="filled">
                {getInitials(user.name)}
              </Avatar>
              <Box miw={0}>
                <Text fw={600} truncate>
                  {user.name}
                </Text>
                <Text size="sm" c="dimmed" truncate>
                  {user.email}
                </Text>
              </Box>
            </Group>
            <Menu.Divider />
            <Menu.Item component={ShellLink} href={ACCOUNT_LINKS.profile} leftSection={<IconUserCircle size={18} />}>
              My profile
            </Menu.Item>
            <Menu.Item component={ShellLink} href={ACCOUNT_LINKS.changePassword} leftSection={<IconLock size={18} />}>
              Change password
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconLogout size={18} />} onClick={() => signOut.mutate()}>
              Log out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        // Signed out: one plain "Log in" button, not a profile menu for a profile that doesn't
        // exist yet. Registering is one click further, inside the log-in pop-up. The same button
        // when collapsed (its label fades), so the menu doesn't swap components mid-animation.
        <Tooltip label="Log in" position="right" disabled={!collapsed}>
          <Button variant="white" fullWidth justify="flex-start" px={10} leftSection={<IconLogin size={18} />} className={classes.loginButton} onClick={() => setView("login")} aria-label="Log in">
            <span className={classes.label}>Log in</span>
          </Button>
        </Tooltip>
      )}

      <AccountModal
        view={view}
        onViewChange={setView}
        onSignedIn={() => {
          setView(null);
          sessionChanged();
        }}
      />
    </>
  );
}
