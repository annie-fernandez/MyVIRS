"use client";

import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconHome, IconRefresh, IconX } from "@tabler/icons-react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { PageHeader } from "@/components/ui/page-header";

/**
 * Shown in place of any screen that fails to render, inside the site shell, so the header and
 * sidebar keep working. Expected failures (a request that fails) stay as Alerts on their own screen.
 * The error itself isn't shown: in production it's a generic message and a digest, which mean
 * nothing to a reader. React logs it in the browser console, and the server logs its own errors.
 */
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Stack gap="xl">
      <PageHeader title="Something went wrong" description="This page didn't load. Try again, or go back to Home." />
      <Alert color="red" icon={<IconX size={18} />} title="We couldn't show this page">
        <Text size="sm">If it keeps happening, wait a minute and try again.</Text>
        <Group justify="flex-end" mt="sm">
          <Button component={ShellLink} href="/dashboard" variant="default" leftSection={<IconHome size={16} />}>
            Go to Home
          </Button>
          <Button onClick={() => retry()} leftSection={<IconRefresh size={16} />}>
            Try again
          </Button>
        </Group>
      </Alert>
    </Stack>
  );
}
