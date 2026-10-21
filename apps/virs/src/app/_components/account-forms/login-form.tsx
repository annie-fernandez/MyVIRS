"use client";

import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { AuthError } from "@/lib/auth/auth-error";

/** Log in with a user name or an email. Leads to registration and password recovery. */
export function LoginForm({ onSuccess, onForgot, onRegister }: { onSuccess: () => void; onForgot: () => void; onRegister: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useMutation({
    mutationFn: async ({ identifier, password }: { identifier: string; password: string }) => {
      // Accept a user name or an email, like Forgot password does. Sending an email to the
      // user-name sign-in fails as an "invalid username", which read as a wrong password.
      const { error } = identifier.includes("@")
        ? await authClient.signIn.email({ email: identifier.toLowerCase(), password })
        : await authClient.signIn.username({ username: identifier, password });
      if (error) throw AuthError.from(error);
    },
    onSuccess: () => {
      setPassword("");
      onSuccess();
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    signIn.mutate({ identifier: username.trim(), password });
  }

  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <TextInput label="User name or email" value={username} onChange={(e) => setUsername(e.currentTarget.value)} autoComplete="username" required withAsterisk={false} data-autofocus />
        <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} autoComplete="current-password" required withAsterisk={false} />
        {signIn.isError && (
          <Alert color="red" icon={<IconX size={18} />}>
            {signIn.error instanceof AuthError && signIn.error.status === 429
              ? "Too many attempts. Try again in a minute."
              : "That user name or email and password don't match. Check them, or use Forgot your password below."}
          </Alert>
        )}
        <Button type="submit" loading={signIn.isPending} fullWidth>
          Log in
        </Button>
        <Anchor component="button" type="button" size="sm" ta="center" onClick={onForgot}>
          Forgot your password?
        </Anchor>
        <Text size="sm" c="dimmed" ta="center">
          Don&apos;t have an account?{" "}
          <Anchor component="button" type="button" fw={600} onClick={onRegister}>
            Register
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
