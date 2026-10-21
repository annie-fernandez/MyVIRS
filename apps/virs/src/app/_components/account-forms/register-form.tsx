"use client";

import { Alert, Anchor, Button, PasswordInput, Select, Stack, Text, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconUserPlus, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { USER_LEVEL_SELECT_DATA } from "@/lib/account-schemas/user-level-select-data";
import { errorMessage } from "@/lib/api-client/error-message";
import { authClient } from "@/lib/auth/auth-client";
import { AuthError } from "@/lib/auth/auth-error";
import { signUpSchema, type SignUpValues } from "./sign-up-schema";

/** The sign-up form (see AccountForms). */
export function RegisterForm({ onSuccess, onLogin }: { onSuccess: () => void; onLogin: () => void }) {
  const form = useForm<SignUpValues>({
    mode: "uncontrolled",
    initialValues: { name: "", username: "", email: "", userLevel: null, password: "" },
    validate: schemaResolver(signUpSchema, { sync: true }),
  });

  const signUp = useMutation({
    mutationFn: async (values: SignUpValues) => {
      const { error } = await authClient.signUp.email({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        userLevel: values.userLevel ?? undefined,
      });
      if (error) throw AuthError.from(error);
    },
    onSuccess,
  });
  const code = signUp.error instanceof AuthError ? signUp.error.code : undefined;

  return (
    <form onSubmit={form.onSubmit((values) => signUp.mutate(values))}>
      <Stack gap="sm">
        <TextInput label="Full name" autoComplete="name" data-autofocus key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="User name" autoComplete="username" key={form.key("username")} {...form.getInputProps("username")} />
        <TextInput label="Email" type="email" autoComplete="email" key={form.key("email")} {...form.getInputProps("email")} />
        <Select label="I am a… (optional)" placeholder="Choose one" data={USER_LEVEL_SELECT_DATA} clearable allowDeselect key={form.key("userLevel")} {...form.getInputProps("userLevel")} />
        <PasswordInput label="Password" description="At least 8 characters." autoComplete="new-password" key={form.key("password")} {...form.getInputProps("password")} />
        {signUp.isError && (
          <Alert color="red" icon={<IconX size={18} />}>
            {code === "USERNAME_IS_ALREADY_TAKEN" || code === "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER"
              ? "That user name is taken. Try another one."
              : code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
                ? "An account with this email already exists. Log in instead, or reset your password."
                : errorMessage(signUp.error)}
          </Alert>
        )}
        <Button type="submit" fullWidth mt={4} loading={signUp.isPending} leftSection={<IconUserPlus size={16} />}>
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
