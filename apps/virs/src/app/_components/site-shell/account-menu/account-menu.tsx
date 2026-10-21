"use client";

import { ActionIcon, Avatar, Button, Menu, Modal, Tooltip, UnstyledButton } from "@mantine/core";
import { IconChevronRight, IconId, IconKey, IconLogin, IconLogout } from "@tabler/icons-react";
import { useState } from "react";
import { useSession } from "@/lib/auth/use-session";
import { useSessionChanged } from "@/lib/auth/use-session-changed";
import { useSignOut } from "@/lib/auth/use-sign-out";
import { ACCOUNT_FORM_TITLES, type AccountFormView } from "../../account-forms/account-form-view";
import { AccountForms } from "../../account-forms/account-forms";
import classes from "../site-shell.module.css";
import { ACCOUNT_LINKS } from "./account-links";
import { getInitials } from "./get-initials";

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
        <Menu position="right-end" width={220} shadow="md" radius="md" withinPortal>
          <Menu.Target>
            <Tooltip label={user.name} position="right" disabled={!collapsed}>
              <UnstyledButton className={classes.menuItem} aria-label={`Your account: ${user.name}`}>
                <Avatar size={24} radius="xl" color="virsOrange" variant="filled" fz={11}>
                  {getInitials(user.name)}
                </Avatar>
                <span className={classes.label}>{user.name}</span>
                <IconChevronRight size={14} className={classes.menuChevron} />
              </UnstyledButton>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Signed in as {user.name}</Menu.Label>
            <Menu.Item component="a" href={ACCOUNT_LINKS.profile} leftSection={<IconId size={16} />}>My profile</Menu.Item>
            <Menu.Item component="a" href={ACCOUNT_LINKS.changePassword} leftSection={<IconKey size={16} />}>Change password</Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconLogout size={16} />} onClick={() => signOut.mutate()}>Log out</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : collapsed ? (
        <Tooltip label="Log in" position="right">
          <ActionIcon variant="white" size={36} mx="auto" mt={4} display="flex" className={classes.loginButton} onClick={() => setView("login")} aria-label="Log in">
            <IconLogin size={18} />
          </ActionIcon>
        </Tooltip>
      ) : (
        // Signed out: one plain "Log in" button, not a profile menu for a profile that doesn't
        // exist yet. Registering is one click further, inside the log-in pop-up.
        <Button variant="white" fullWidth leftSection={<IconLogin size={16} />} className={classes.loginButton} onClick={() => setView("login")}>
          Log in
        </Button>
      )}

      <Modal opened={view !== null} onClose={() => setView(null)} title={view && ACCOUNT_FORM_TITLES[view]}>
        {view && (
          <AccountForms
            view={view}
            onViewChange={setView}
            onSignedIn={() => {
              setView(null);
              sessionChanged();
            }}
          />
        )}
      </Modal>
    </>
  );
}
