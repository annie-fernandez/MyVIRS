"use client";

import { Button, Group, Stack } from "@mantine/core";
import { IconLock, IconLogin, IconUserPlus } from "@tabler/icons-react";
import type { Route } from "next";
import { useState } from "react";
import type { AccountFormView } from "@/app/_components/account-forms/account-form-view";
import { AccountModal } from "@/app/_components/account-forms/account-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";

/**
 * Says what needs an account, with Create an account and Log in buttons that open the same pop-up as
 * the side menu's Log in (so there's never a form on the page and another in a pop-up). Afterwards
 * the visitor goes back to `next`.
 */
export function SignInScreen({ title, next, startWith }: { title: string; next: Route | null; startWith: AccountFormView | null }) {
  // Old /register links arrive with the sign-up form already open.
  const [view, setView] = useState<AccountFormView | null>(startWith);

  function signedIn() {
    // A full page load, not a client-side navigation: logging in changed the session cookie, and
    // everything cached while signed out (pages, queries) has to go. Replace, so Back skips this page.
    window.location.replace(next ?? "/dashboard");
  }

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Log <Marker>in</Marker>
          </>
        }
        description="This page needs a free VIRS account."
        descriptionLines={1}
      />
      <EmptyState
        icon={IconLock}
        title={title}
        description="Analyzing works without an account, but nothing is saved. Log in, or create a free account, and you'll go straight back to where you were."
        action={
          <Group justify="center" gap="sm">
            <Button variant="default" leftSection={<IconUserPlus size={16} />} onClick={() => setView("register")}>
              Create an account
            </Button>
            <Button leftSection={<IconLogin size={16} />} onClick={() => setView("login")}>
              Log in
            </Button>
          </Group>
        }
      />
      <AccountModal view={view} onViewChange={setView} onSignedIn={signedIn} />
    </Stack>
  );
}
