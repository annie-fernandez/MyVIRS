"use client";

import { Alert, Anchor, Button, Stack, Text, TextInput } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client/api-fetch";

/** "Reset your password": emails a reset link for a user name or an email. */
export function RecoveryForm({ onLogin }: { onLogin: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const sendLink = useMutation({
    // These endpoints answer identically whether or not the account exists, so the message
    // below never confirms that it does.
    mutationFn: (value: string) => apiFetch<void>(`/api/user/${value.includes("@") ? "recovery_email" : "recovery"}/${encodeURIComponent(value)}`),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = identifier.trim();
    if (value) sendLink.mutate(value);
  }

  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <TextInput
          label="User name or email"
          description="We'll email a reset link, with your user name, to the address on the account."
          value={identifier}
          onChange={(e) => setIdentifier(e.currentTarget.value)}
          required
          withAsterisk={false}
          data-autofocus
        />
        {sendLink.isSuccess && (
          <Alert color="virsGreen" icon={<IconCheck size={18} />}>
            If an account matches, a reset link is on its way. Check your inbox and spam folder.
          </Alert>
        )}
        {sendLink.isError && (
          <Alert color="red" icon={<IconX size={18} />}>
            We couldn&apos;t send the email. Please try again.
          </Alert>
        )}
        <Button type="submit" loading={sendLink.isPending} disabled={sendLink.isSuccess} fullWidth>
          Send reset link
        </Button>
        <Text size="sm" c="dimmed" ta="center">
          Remembered it?{" "}
          <Anchor component="button" type="button" fw={600} onClick={onLogin}>
            Log in
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
