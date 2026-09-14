"use client";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  Modal,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { PageHeader } from "@/components/page-header";
import {
  changePasswordSchema,
  profileSchema,
  USER_LEVEL_SELECT_DATA,
  type ProfileValues,
} from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";

interface AccountUser extends ProfileValues {
  createdAt: string;
}

function ProfileCard({ user }: { user: AccountUser }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const form = useForm<ProfileValues>({
    mode: "uncontrolled",
    initialValues: { name: user.name, username: user.username, email: user.email, userLevel: user.userLevel },
    validate: schemaResolver(profileSchema, { sync: true }),
  });

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    try {
      if (values.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        const { error } = await authClient.changeEmail({ newEmail: values.email.trim() });
        if (error) throw new Error(error.message ?? "Could not change your email.");
      }
      const { error } = await authClient.updateUser({
        name: values.name.trim(),
        username: values.username.trim(),
        userLevel: values.userLevel ?? "",
      });
      if (error) throw new Error(error.message ?? "Could not update your profile.");

      form.resetDirty(values);
      notifications.show({ color: "teal", title: "Profile saved", message: "Your account details were updated." });
      router.refresh();
    } catch (error) {
      notifications.show({ color: "red", title: "Could not save", message: (error as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card withBorder padding="lg">
      <Title order={4}>Profile</Title>
      <Text size="sm" c="dimmed" mb="md">
        Member since {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Full name" key={form.key("name")} {...form.getInputProps("name")} />
            <TextInput label="Username" key={form.key("username")} {...form.getInputProps("username")} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput label="Email" type="email" key={form.key("email")} {...form.getInputProps("email")} />
            <Select
              label="I am a…"
              placeholder="Not specified"
              data={USER_LEVEL_SELECT_DATA}
              clearable
              key={form.key("userLevel")}
              {...form.getInputProps("userLevel")}
            />
          </SimpleGrid>
          <Group justify="flex-end">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}

type PasswordValues = z.infer<typeof changePasswordSchema>;

function PasswordCard() {
  const [saving, setSaving] = useState(false);
  const form = useForm<PasswordValues>({
    mode: "uncontrolled",
    initialValues: { currentPassword: "", password: "", confirmPassword: "" },
    validate: schemaResolver(changePasswordSchema, { sync: true }),
  });

  async function onSubmit(values: PasswordValues) {
    setSaving(true);
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.password,
      revokeOtherSessions: true,
    });
    setSaving(false);
    if (error) {
      form.setFieldError("currentPassword", error.status === 400 ? "Current password is incorrect" : (error.message ?? "Could not change password"));
      return;
    }
    form.reset();
    notifications.show({ color: "teal", title: "Password changed", message: "You were signed out of your other devices." });
  }

  return (
    <Card withBorder padding="lg">
      <Title order={4} mb="md">
        Change password
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            key={form.key("currentPassword")}
            {...form.getInputProps("currentPassword")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <PasswordInput label="New password" autoComplete="new-password" key={form.key("password")} {...form.getInputProps("password")} />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
            />
          </SimpleGrid>
          <Group justify="flex-end">
            <Button type="submit" variant="default" loading={saving}>
              Update password
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}

function DeleteAccountCard() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    const { error } = await authClient.deleteUser({ password });
    setDeleting(false);
    if (error) {
      setError(error.status === 400 ? "That password is incorrect." : (error.message ?? "Could not delete your account."));
      return;
    }
    notifications.show({ title: "Account deleted", message: "Your account and data were removed." });
    router.push("/");
    router.refresh();
  }

  return (
    <Card withBorder padding="lg" style={{ borderColor: "var(--mantine-color-red-outline)" }}>
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Title order={4} c="red">
            Delete account
          </Title>
          <Text size="sm" c="dimmed">
            Permanently remove your account. This cannot be undone.
          </Text>
        </div>
        <Button color="red" variant="light" onClick={open}>
          Delete account
        </Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Delete your account?" centered>
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={18} />}>
            Your profile will be deleted immediately and you will be signed out.
          </Alert>
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <PasswordInput
            label="Enter your password to confirm"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Checkbox
            label="I understand this cannot be undone"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.currentTarget.checked)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button color="red" disabled={!password || !confirmed} loading={deleting} onClick={deleteAccount}>
              Delete my account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}

export function AccountView({ user }: { user: AccountUser }) {
  return (
    <Container size="md">
      <PageHeader title="My account" description={`Signed in as @${user.username}`} icon={<IconUser size={24} />} />
      <Stack gap="lg">
        <ProfileCard user={user} />
        <PasswordCard />
        <DeleteAccountCard />
      </Stack>
    </Container>
  );
}
