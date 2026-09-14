"use client";

import { Alert, Anchor, Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthCard, safeRedirect } from "./auth-card";

export function SignInForm() {
  const router = useRouter();
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { identifier: "", password: "" },
    validate: {
      identifier: (value) => (value.trim() ? null : "Enter your username or email"),
      password: (value) => (value ? null : "Enter your password"),
    },
  });

  async function onSubmit({ identifier, password }: { identifier: string; password: string }) {
    setLoading(true);
    setError(null);
    const value = identifier.trim();
    const { error } = value.includes("@")
      ? await authClient.signIn.email({ email: value, password })
      : await authClient.signIn.username({ username: value, password });
    setLoading(false);

    if (error) {
      setError(error.status === 429 ? "Too many attempts. Please wait a minute and try again." : "Incorrect username or password.");
      return;
    }
    router.push(redirectTo as Route);
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your VIRS account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Anchor component={Link} href="/sign-up" size="sm">
            Create one
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
          <TextInput
            label="Username or email"
            autoComplete="username"
            autoFocus
            key={form.key("identifier")}
            {...form.getInputProps("identifier")}
          />
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />
          <Group justify="flex-end">
            <Anchor component={Link} href="/forgot-password" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthCard>
  );
}
