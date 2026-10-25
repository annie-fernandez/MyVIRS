"use client";

import { Button, Stack } from "@mantine/core";
import { IconFileUnknown, IconHome } from "@tabler/icons-react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function NotFound() {
  return (
    <Stack gap="xl">
      <PageHeader title="Page not found" description="That address isn't a page on VIRS. Open Home, or pick a screen from the menu." />
      <EmptyState
        icon={IconFileUnknown}
        title="Nothing is here"
        description="If you followed an old bookmark, the page may have moved. Home is the place to start."
        action={
          <Button component={ShellLink} href="/dashboard" leftSection={<IconHome size={16} />}>
            Go to Home
          </Button>
        }
      />
    </Stack>
  );
}
