"use client";

import { Alert, Anchor, Button, PasswordInput, Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUpSchema, USER_LEVEL_SELECT_DATA, type SignUpValues } from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpValues>({
    mode: "uncontrolled",
    initialValues: { username: "", name: "", email: "", userLevel: null, password: "", confirmPassword: "" },
    validate: schemaResolver(signUpSchema, { sync: true }),
  });

  async function onSubmit(values: SignUpValues) {
    setLoading(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      username: values.username.trim(),
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      userLevel: values.userLevel ?? undefined,
    });
    setLoading(false);

    if (error) {
      setError(error.message ?? "We couldn't create your account. Please try again.");
      return;
    }
    notifications.show({ color: "teal", title: "Welcome to VIRS", message: "Your account is ready." });
    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard
      title="Create an account"
      description="Save your details and access your profile from any device"
      footer={
        <>
          Already have an account?{" "}
          <Anchor component={Link} href="/sign-in" size="sm">
            Sign in
          </Anchor>
        </>
      }
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}
          <TextInput label="Full name" autoComplete="name" required key={form.key("name")} {...form.getInputProps("name")} />
          <TextInput label="Username" autoComplete="username" required key={form.key("username")} {...form.getInputProps("username")} />
          <TextInput label="Email" type="email" autoComplete="email" required key={form.key("email")} {...form.getInputProps("email")} />
          <Select
            label="I am a…"
            placeholder="Optional"
            data={USER_LEVEL_SELECT_DATA}
            clearable
            key={form.key("userLevel")}
            {...form.getInputProps("userLevel")}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <PasswordInput label="Password" autoComplete="new-password" required key={form.key("password")} {...form.getInputProps("password")} />
            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              required
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
            />
          </SimpleGrid>
          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </Stack>
      </form>
    </AuthCard>
  );
}
