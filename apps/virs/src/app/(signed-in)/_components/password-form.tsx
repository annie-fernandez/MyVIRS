"use client";

import { Alert, Button, Group, PasswordInput, Stack } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconCheck } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { errorMessage } from "@/lib/api-client/error-message";
import { authClient } from "@/lib/auth/auth-client";
import { AuthError } from "@/lib/auth/auth-error";
import { changePasswordSchema, type ChangePasswordValues } from "../_lib/change-password-schema";

/** Change password for the signed-in user. Signs out their other devices. */
export function PasswordForm() {
  const form = useForm<ChangePasswordValues>({
    mode: "uncontrolled",
    initialValues: { currentPassword: "", password: "", confirmPassword: "" },
    validate: schemaResolver(changePasswordSchema, { sync: true }),
  });

  const changePassword = useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      const { error } = await authClient.changePassword({ currentPassword: values.currentPassword, newPassword: values.password, revokeOtherSessions: true });
      if (error) throw AuthError.from(error);
    },
    onSuccess: () => form.reset(),
    onError: (error) => {
      const wrongPassword = error instanceof AuthError && (error.status === 400 || error.code === "INVALID_PASSWORD");
      form.setFieldError("currentPassword", wrongPassword ? "That isn't your current password." : errorMessage(error));
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => changePassword.mutate(values))}>
      <Stack gap="md">
        {changePassword.isSuccess && (
          <Alert color="virsGreen" icon={<IconCheck size={18} />}>
            Your password is changed. Any other devices you were signed in on have been signed out.
          </Alert>
        )}
        <PasswordInput label="Current password" autoComplete="current-password" key={form.key("currentPassword")} {...form.getInputProps("currentPassword")} />
        <PasswordInput label="New password" description="At least 8 characters." autoComplete="new-password" key={form.key("password")} {...form.getInputProps("password")} />
        <PasswordInput label="Confirm new password" autoComplete="new-password" key={form.key("confirmPassword")} {...form.getInputProps("confirmPassword")} />
        <Group justify="flex-end">
          <Button type="submit" loading={changePassword.isPending}>
            Change password
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
