"use client";

import { Alert, Button, Group, PasswordInput, SimpleGrid, Stack } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconCheck, IconLogin, IconX } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ShellLink } from "@/components/layout/shell-link";
import { Marker, PageHeader, Surface } from "@/components/ui";
import { newPasswordSchema, type NewPasswordValues } from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";

const BAD_LINK = "This reset link is invalid or has expired. Use Forgot password in the My Profile menu to get a new one.";

/** Where the password-reset email lands (/restore?token=…). */
export function RestoreScreen() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(searchParams.get("error") ? BAD_LINK : null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<NewPasswordValues>({
    mode: "uncontrolled",
    initialValues: { password: "", confirmPassword: "" },
    validate: schemaResolver(newPasswordSchema, { sync: true }),
  });

  async function onSubmit(values: NewPasswordValues) {
    if (!token) return;
    setLoading(true);
    setError(null);
    const { error: resetError } = await authClient.resetPassword({ newPassword: values.password, token });
    setLoading(false);
    if (resetError) setError(BAD_LINK);
    else setDone(true);
  }

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Choose a new <Marker>password</Marker>
          </>
        }
        description="Pick a password you haven't used here before."
      />
      <Surface maw={640}>
        {done ? (
          <Stack gap="md">
            <Alert color="virsGreen" icon={<IconCheck size={18} />} title="Password changed">
              You can log in with your new password now. Any other devices have been signed out.
            </Alert>
            <Group justify="flex-end">
              <Button component={ShellLink} href="/dashboard?login=1" leftSection={<IconLogin size={16} />}>
                Log in
              </Button>
            </Group>
          </Stack>
        ) : !token ? (
          <Alert color="red" icon={<IconX size={18} />}>
            {error ?? "This page needs the link from your password reset email. Use Forgot password in the My Profile menu to get one."}
          </Alert>
        ) : (
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <PasswordInput label="New password" description="At least 8 characters." autoComplete="new-password" data-autofocus key={form.key("password")} {...form.getInputProps("password")} />
                <PasswordInput label="Confirm new password" autoComplete="new-password" key={form.key("confirmPassword")} {...form.getInputProps("confirmPassword")} />
              </SimpleGrid>
              {error && (
                <Alert color="red" icon={<IconX size={18} />}>
                  {error}
                </Alert>
              )}
              <Group justify="flex-end">
                <Button type="submit" loading={loading}>
                  Save new password
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Surface>
    </Stack>
  );
}
