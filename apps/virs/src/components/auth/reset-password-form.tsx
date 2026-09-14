"use client";

import { Alert, Anchor, Button, PasswordInput, Stack } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { newPasswordSchema } from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

type Values = z.infer<typeof newPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(searchParams.get("error") ? "This reset link is invalid or has expired." : null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<Values>({
    mode: "uncontrolled",
    initialValues: { password: "", confirmPassword: "" },
    validate: schemaResolver(newPasswordSchema, { sync: true }),
  });

  async function onSubmit(values: Values) {
    if (!token) return;
    setLoading(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: values.password, token });
    setLoading(false);
    if (error) setError(error.message ?? "This reset link is invalid or has expired.");
    else setDone(true);
  }

  const footer = (
    <Anchor component={Link} href="/forgot-password" size="sm">
      Request a new link
    </Anchor>
  );

  if (done) {
    return (
      <AuthCard title="Password updated">
        <Stack gap="md">
          <Alert color="teal" icon={<IconCircleCheck size={18} />}>
            Your password has been changed. You have been signed out of other devices.
          </Alert>
          <Button component={Link} href="/sign-in" fullWidth>
            Sign in
          </Button>
        </Stack>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" footer={footer}>
      {!token ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />}>
          {error ?? "This page needs the link from your password reset email."}
        </Alert>
      ) : (
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            {error && (
              <Alert color="red" icon={<IconAlertCircle size={18} />}>
                {error}
              </Alert>
            )}
            <PasswordInput label="New password" autoComplete="new-password" autoFocus key={form.key("password")} {...form.getInputProps("password")} />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
            />
            <Button type="submit" fullWidth loading={loading}>
              Update password
            </Button>
          </Stack>
        </form>
      )}
    </AuthCard>
  );
}
