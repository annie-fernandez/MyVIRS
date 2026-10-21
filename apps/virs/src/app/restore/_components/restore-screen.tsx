"use client";

import { Alert, Button, Group, PasswordInput, Stack } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconCheck, IconLogin, IconX } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ShellLink } from "@/components/shell-link/shell-link";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/lib/auth/auth-client";
import { AuthError } from "@/lib/auth/auth-error";
import { newPasswordSchema, type NewPasswordValues } from "../_lib/new-password-schema";

const BAD_LINK = "This reset link is invalid or has expired. Use “Forgot your password?” when you log in to get a new one.";

/** Where the password-reset email lands (/restore?token=…). */
export function RestoreScreen() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<NewPasswordValues>({
    mode: "uncontrolled",
    initialValues: { password: "", confirmPassword: "" },
    validate: schemaResolver(newPasswordSchema, { sync: true }),
  });

  const reset = useMutation({
    mutationFn: async ({ password, token }: { password: string; token: string }) => {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) throw AuthError.from(error);
    },
  });
  // Better Auth sends a bad or expired link back here with ?error=…; a failed save means the same.
  const error = reset.isError || searchParams.get("error") ? BAD_LINK : null;

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
      <Surface maw={460}>
        {reset.isSuccess ? (
          <Stack gap="md">
            <Alert color="virsGreen" icon={<IconCheck size={18} />} title="Password changed">
              Log in with your user name (or email) and the new password. Any other devices have been signed out.
            </Alert>
            <Group justify="flex-end">
              <Button component={ShellLink} href="/sign-in" leftSection={<IconLogin size={16} />}>
                Log in
              </Button>
            </Group>
          </Stack>
        ) : !token ? (
          <Alert color="red" icon={<IconX size={18} />}>
            {error ?? "This page needs the link from your password reset email. Use “Forgot your password?” when you log in to get one."}
          </Alert>
        ) : (
          <form onSubmit={form.onSubmit((values) => reset.mutate({ password: values.password, token }))}>
            <Stack gap="md">
              <PasswordInput label="New password" description="At least 8 characters." autoComplete="new-password" data-autofocus key={form.key("password")} {...form.getInputProps("password")} />
              <PasswordInput label="Confirm new password" autoComplete="new-password" key={form.key("confirmPassword")} {...form.getInputProps("confirmPassword")} />
              {error && (
                <Alert color="red" icon={<IconX size={18} />}>
                  {error}
                </Alert>
              )}
              <Group justify="flex-end">
                <Button type="submit" loading={reset.isPending}>
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
