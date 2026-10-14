"use client";

import {
  Alert,
  Anchor,
  Avatar,
  Button,
  Menu,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCheck,
  IconChevronDown,
  IconId,
  IconKey,
  IconLogin,
  IconLogout,
  IconX,
} from "@tabler/icons-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { syncLegacySession } from "@/lib/legacy-session";
import { RegisterForm } from "@/components/account/register-form";
import { ACCOUNT_LINKS } from "./nav";

/** The header's account control: a Log in button, or the signed-in user's menu. Registration and password recovery open from the log-in pop-up. */
export function AccountMenu({ buttonClassName }: { buttonClassName?: string }) {
  const { data: session, isPending } = authClient.useSession();
  const [loginOpened, login] = useDisclosure(false);
  const [recoveryOpened, recovery] = useDisclosure(false);
  const [registerOpened, register] = useDisclosure(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Pages that need an account send people to /dashboard?login=1&next=<page> (see lib/session.ts).
  const loginRequested = searchParams.get("login") === "1";
  // Old links to /register redirect to /dashboard?register=1.
  const registerRequested = searchParams.get("register") === "1";
  const next = searchParams.get("next");

  useEffect(() => {
    if (isPending || session) return;
    if (loginRequested) login.open();
    else if (registerRequested) register.open();
    // The open functions are stable; only react to the request and the session state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginRequested, registerRequested, isPending, session]);

  function afterLogin() {
    if (next?.startsWith("/")) router.push(next as Route);
    router.refresh();
  }

  useEffect(() => {
    if (!isPending) syncLegacySession(session?.user);
  }, [isPending, session]);

  async function signOut() {
    await authClient.signOut();
    syncLegacySession(null);
    router.refresh();
  }

  const user = session?.user;
  const firstName = user?.name.split(" ")[0] ?? "";
  const initials = (user?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <>
      {user ? (
        // Signed in: the menu holds the account itself (profile, password, log out). What the user
        // has made (their history) is a destination in the sidebar, not in here.
        <Menu position="bottom-end" width={220} shadow="md" radius="md" withinPortal>
          <Menu.Target>
            <UnstyledButton className={buttonClassName} aria-label="Your account" style={{ borderRadius: 8, padding: "4px 8px 4px 4px", display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar size={24} radius="xl" color="virsOrange" variant="filled" fz={11}>
                {initials}
              </Avatar>
              <Text size="sm" fw={600} visibleFrom="xs" inherit>
                {firstName}
              </Text>
              <IconChevronDown size={14} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Signed in as {user.name}</Menu.Label>
            <Menu.Item component="a" href={ACCOUNT_LINKS.profile} leftSection={<IconId size={16} />}>My profile</Menu.Item>
            <Menu.Item component="a" href={ACCOUNT_LINKS.changePassword} leftSection={<IconKey size={16} />}>Change password</Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<IconLogout size={16} />} onClick={signOut}>Log out</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        // Signed out: one plain "Log in" button, not a profile menu for a profile that doesn't
        // exist yet. Registering is one click further, inside the log-in pop-up.
        <Button variant="white" size="sm" loading={isPending} leftSection={<IconLogin size={16} />} onClick={login.open}>
          Log in
        </Button>
      )}

      <LoginModal
        opened={loginOpened}
        onClose={login.close}
        onSuccess={afterLogin}
        onForgot={() => { login.close(); recovery.open(); }}
        onRegister={() => { login.close(); register.open(); }}
      />
      <Modal opened={registerOpened} onClose={register.close} title="Create your account">
        <RegisterForm
          onSuccess={() => { register.close(); router.refresh(); }}
          onLogin={() => { register.close(); login.open(); }}
        />
      </Modal>
      <RecoveryModal opened={recoveryOpened} onClose={recovery.close} onLogin={login.open} />
    </>
  );
}

function LoginModal({ opened, onClose, onSuccess, onForgot, onRegister }: { opened: boolean; onClose: () => void; onSuccess: () => void; onForgot: () => void; onRegister: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const { data, error: signInError } = await authClient.signIn.username({ username: username.trim(), password });
    setSubmitting(false);
    if (signInError) {
      setError(
        signInError.status === 429
          ? "Too many attempts. Try again in a minute."
          : "Incorrect user name or password.",
      );
      return;
    }
    syncLegacySession(data?.user as Parameters<typeof syncLegacySession>[0]);
    setPassword("");
    onClose();
    onSuccess();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Log in to VIRS">
      <form onSubmit={submit}>
        <Stack gap="sm">
          <TextInput label="User name" value={username} onChange={(e) => setUsername(e.currentTarget.value)} autoComplete="username" required withAsterisk={false} data-autofocus />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} autoComplete="current-password" required withAsterisk={false} />
          {error && <Alert color="red" icon={<IconX size={18} />}>{error}</Alert>}
          <Button type="submit" loading={submitting} fullWidth>
            Log in
          </Button>
          <Anchor component="button" type="button" size="sm" ta="center" onClick={onForgot}>
            Forgot your password?
          </Anchor>
          <Text size="sm" c="dimmed" ta="center">
            Don't have an account?{" "}
            <Anchor component="button" type="button" fw={600} onClick={onRegister}>
              Register
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Modal>
  );
}

function RecoveryModal({ opened, onClose, onLogin }: { opened: boolean; onClose: () => void; onLogin: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = identifier.trim();
    if (!value) return;
    setStatus("sending");
    // The same endpoints the Angular recovery form uses. They answer identically whether or not
    // the account exists, so the message below never confirms that it does.
    const path = value.includes("@") ? "recovery_email" : "recovery";
    const response = await fetch(`/api/user/${path}/${encodeURIComponent(value)}`).catch(() => null);
    setStatus(response?.ok ? "sent" : "failed");
  }

  function close() {
    setStatus("idle");
    setIdentifier("");
    onClose();
  }

  return (
    <Modal opened={opened} onClose={close} title="Reset your password">
      <form onSubmit={submit}>
        <Stack gap="sm">
          <TextInput
            label="User name or email"
            description="We'll email a reset link, with your user name, to the address on the account."
            value={identifier}
            onChange={(e) => setIdentifier(e.currentTarget.value)}
            required withAsterisk={false}
            data-autofocus
          />
          {status === "sent" && (
            <Alert color="virsGreen" icon={<IconCheck size={18} />}>
              If an account matches, a reset link is on its way. Check your inbox and spam folder.
            </Alert>
          )}
          {status === "failed" && (
            <Alert color="red" icon={<IconX size={18} />}>
              We couldn&apos;t send the email. Please try again.
            </Alert>
          )}
          <Button type="submit" loading={status === "sending"} disabled={status === "sent"} fullWidth>
            Send reset link
          </Button>
          <Text size="sm" c="dimmed" ta="center">
            Remembered it?{" "}
            <Anchor component="button" type="button" fw={600} onClick={() => { close(); onLogin(); }}>
              Log in
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Modal>
  );
}
