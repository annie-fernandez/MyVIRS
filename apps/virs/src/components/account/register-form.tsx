"use client";

import { Alert, Anchor, Button, PasswordInput, Select, Stack, Text, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconUserPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { signUpSchema, USER_LEVEL_SELECT_DATA, type SignUpValues } from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";
import { syncLegacySession } from "@/lib/legacy-session";

/** The sign-up form, shown in a pop-up from the account menu (see AccountMenu). */
export function RegisterForm({ onSuccess, onLogin }: { onSuccess: () => void; onLogin: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpValues>({
    mode: "uncontrolled",
    initialValues: { name: "", username: "", email: "", userLevel: null, password: "" },
    validate: schemaResolver(signUpSchema, { sync: true }),
  });

  async function onSubmit(values: SignUpValues) {
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await authClient.signUp.email({
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      userLevel: values.userLevel ?? undefined,
    });
    setLoading(false);
    if (signUpError) {
      setError(
        signUpError.code === "USERNAME_IS_ALREADY_TAKEN" || signUpError.code === "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER"
          ? "That user name is taken. Try another one."
          : signUpError.code === "USER_ALREADY_EXISTS" || signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? "An account with this email already exists. Log in instead, or reset your password."
            : (signUpError.message ?? "We couldn't create your account. Please try again."),
      );
      return;
    }
    syncLegacySession(data?.user as Parameters<typeof syncLegacySession>[0]);
    onSuccess();
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="sm">
        <TextInput label="Full name" autoComplete="name" data-autofocus key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="User name" autoComplete="username" key={form.key("username")} {...form.getInputProps("username")} />
        <TextInput label="Email" type="email" autoComplete="email" key={form.key("email")} {...form.getInputProps("email")} />
        <Select label="I am a… (optional)" placeholder="Choose one" data={USER_LEVEL_SELECT_DATA} clearable allowDeselect key={form.key("userLevel")} {...form.getInputProps("userLevel")} />
        <PasswordInput label="Password" description="At least 8 characters." autoComplete="new-password" key={form.key("password")} {...form.getInputProps("password")} />
        {error && (
          <Alert color="red" icon={<IconX size={18} />}>
            {error}
          </Alert>
        )}
        <Button type="submit" fullWidth mt={4} loading={loading} leftSection={<IconUserPlus size={16} />}>
          Create account
        </Button>
        <Text size="sm" c="dimmed" ta="center">
          Already have an account?{" "}
          <Anchor component="button" type="button" fw={600} onClick={onLogin}>
            Log in
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
