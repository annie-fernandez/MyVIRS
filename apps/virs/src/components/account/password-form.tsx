"use client";

import { Alert, Button, Group, PasswordInput, Stack } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";

/** Change password for the signed-in user. Signs out their other devices. */
export function PasswordForm() {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const form = useForm<ChangePasswordValues>({
    mode: "uncontrolled",
    initialValues: { currentPassword: "", password: "", confirmPassword: "" },
    validate: schemaResolver(changePasswordSchema, { sync: true }),
  });

  async function onSubmit(values: ChangePasswordValues) {
    setSaving(true);
    setDone(false);
    const { error } = await authClient.changePassword({ currentPassword: values.currentPassword, newPassword: values.password, revokeOtherSessions: true });
    setSaving(false);
    if (error) {
      form.setFieldError(
        "currentPassword",
        error.status === 400 || error.code === "INVALID_PASSWORD" ? "That isn't your current password." : (error.message ?? "We couldn't change your password. Please try again."),
      );
      return;
    }
    form.reset();
    setDone(true);
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" maw={420}>
        {done && (
          <Alert color="virsGreen" icon={<IconCheck size={18} />}>
            Your password is changed. Any other devices you were signed in on have been signed out.
          </Alert>
        )}
        <PasswordInput label="Current password" autoComplete="current-password" key={form.key("currentPassword")} {...form.getInputProps("currentPassword")} />
        <PasswordInput label="New password" description="At least 8 characters." autoComplete="new-password" key={form.key("password")} {...form.getInputProps("password")} />
        <PasswordInput label="Confirm new password" autoComplete="new-password" key={form.key("confirmPassword")} {...form.getInputProps("confirmPassword")} />
        <Group justify="flex-end">
          <Button type="submit" loading={saving}>
            Change password
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
