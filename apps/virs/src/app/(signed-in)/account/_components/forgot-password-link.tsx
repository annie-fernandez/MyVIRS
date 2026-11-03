"use client";

import { Alert, Anchor, Group } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { useRequiredUser } from "@/lib/auth/use-required-user";

/**
 * "Forgot your password?" under the current password. Signed in, we already know the email, so it
 * sends the reset link straight to it, through the same endpoint as the log-in pop-up's link.
 */
export function ForgotPasswordLink() {
  const user = useRequiredUser();
  const sendLink = useMutation({ mutationFn: () => apiFetch<void>(`/api/user/recovery_email/${encodeURIComponent(user.email)}`) });

  if (sendLink.isSuccess) {
    return (
      <Alert color="virsGreen" icon={<IconCheck size={18} />}>
        We&apos;ve emailed a reset link to {user.email}. Check your inbox and spam folder.
      </Alert>
    );
  }
  return (
    <>
      {sendLink.isError && (
        <Alert color="red" icon={<IconX size={18} />}>
          We couldn&apos;t send the email. Please try again.
        </Alert>
      )}
      <Group justify="flex-end">
        {/* A button, not a submit: it sits inside the change-password form. */}
        <Anchor component="button" type="button" size="sm" disabled={sendLink.isPending} onClick={() => sendLink.mutate()}>
          {sendLink.isPending ? "Sending a reset link…" : "Forgot your password?"}
        </Anchor>
      </Group>
    </>
  );
}
