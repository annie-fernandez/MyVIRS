"use client";

import { Alert, Anchor, Button, Stack, Text, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconMailCheck } from "@tabler/icons-react";
import { forgotPasswordInput, type ForgotPasswordInput } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { AuthCard } from "./auth-card";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    mode: "uncontrolled",
    initialValues: { identifier: "" },
    validate: schemaResolver(forgotPasswordInput, { sync: true }),
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordInput) =>
      apiFetch<void>("/api/account/forgot-password", { method: "POST", json: values }),
  });

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your username or email and we'll send you a link to choose a new password."
      footer={
        <Anchor component={Link} href="/sign-in" size="sm">
          Back to sign in
        </Anchor>
      }
    >
      {mutation.isSuccess ? (
        <Alert color="teal" icon={<IconMailCheck size={18} />} title="Check your email">
          If an account matches, a reset link is on its way. The link expires in one hour.
        </Alert>
      ) : (
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <Stack gap="md">
            {mutation.isError && (
              <Text c="red" size="sm">
                {mutation.error.message}
              </Text>
            )}
            <TextInput
              label="Username or email"
              autoComplete="username"
              autoFocus
              key={form.key("identifier")}
              {...form.getInputProps("identifier")}
            />
            <Button type="submit" fullWidth loading={mutation.isPending}>
              Send reset link
            </Button>
          </Stack>
        </form>
      )}
    </AuthCard>
  );
}
