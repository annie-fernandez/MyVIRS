"use client";

import { Stack, Title } from "@mantine/core";
import type { Route } from "next";
import { useState } from "react";
import { ACCOUNT_FORM_TITLES, type AccountFormView } from "@/app/_components/account-forms/account-form-view";
import { AccountForms } from "@/app/_components/account-forms/account-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";

/** Says what needs an account, with the log-in form right here; afterwards the visitor goes back to `next`. */
export function SignInScreen({ title, next, startWith }: { title: string; next: Route | null; startWith: AccountFormView }) {
  const [view, setView] = useState<AccountFormView>(startWith);

  function signedIn() {
    // A full page load, not a client-side navigation: logging in changed the session cookie, and
    // everything cached while signed out (pages, queries) has to go. Replace, so Back skips this page.
    window.location.replace(next ?? "/dashboard");
  }

  return (
    <Stack gap="xl">
      <PageHeader title={title} description="You need a free VIRS account for this. Log in, or create one, and you'll go straight back." />
      <Surface maw={460}>
        <Title order={2} fz="lg" mb="md">
          {ACCOUNT_FORM_TITLES[view]}
        </Title>
        <AccountForms view={view} onViewChange={setView} onSignedIn={signedIn} />
      </Surface>
    </Stack>
  );
}
