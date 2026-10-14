"use client";

import { Alert, Button, Checkbox, Group, Modal, PasswordInput, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Marker, PageHeader, Section, Surface } from "@/components/ui";
import { profileSchema, USER_LEVEL_SELECT_DATA, type ProfileValues } from "@/lib/account-schemas";
import { authClient } from "@/lib/auth-client";
import { syncLegacySession } from "@/lib/legacy-session";
import { PasswordForm } from "./password-form";

export interface AccountUser extends ProfileValues {
  createdAt: string;
}

export function AccountScreen({ user }: { user: AccountUser }) {
  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            My <Marker>profile</Marker>
          </>
        }
        description={`Signed in as ${user.username}. Member since ${new Date(user.createdAt).toLocaleDateString([], { dateStyle: "long" })}.`}
      />
      <Section title="Your details">
        <Surface maw={720}>
          <ProfileForm user={user} />
        </Surface>
      </Section>
      <Section title="Password">
        <Surface maw={720}>
          <PasswordForm />
        </Surface>
      </Section>
      <Section title="Delete account">
        <DeleteAccount />
      </Section>
    </Stack>
  );
}

function ProfileForm({ user }: { user: AccountUser }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProfileValues>({
    mode: "uncontrolled",
    initialValues: { name: user.name, username: user.username, email: user.email, userLevel: user.userLevel },
    validate: schemaResolver(profileSchema, { sync: true }),
    onValuesChange: () => setSaved(false),
  });

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    setError(null);
    try {
      if (values.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        const { error: emailError } = await authClient.changeEmail({ newEmail: values.email.trim() });
        if (emailError) throw new Error(emailError.message ?? "We couldn't change your email.");
      }
      const { error: updateError } = await authClient.updateUser({
        name: values.name.trim(),
        username: values.username.trim(),
        userLevel: values.userLevel ?? "",
      });
      if (updateError) {
        throw new Error(
          updateError.code?.startsWith("USERNAME_IS_ALREADY_TAKEN") ? "That user name is taken. Try another one." : (updateError.message ?? "We couldn't save your details."),
        );
      }
      const { data } = await authClient.getSession();
      syncLegacySession(data?.user);
      form.resetDirty(values);
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput label="Full name" autoComplete="name" key={form.key("name")} {...form.getInputProps("name")} />
          <TextInput label="User name" autoComplete="username" key={form.key("username")} {...form.getInputProps("username")} />
          <TextInput label="Email" type="email" autoComplete="email" key={form.key("email")} {...form.getInputProps("email")} />
          <Select label="I am a…" placeholder="Not specified" data={USER_LEVEL_SELECT_DATA} clearable allowDeselect key={form.key("userLevel")} {...form.getInputProps("userLevel")} />
        </SimpleGrid>
        {saved && (
          <Alert color="virsGreen" icon={<IconCheck size={18} />}>
            Your details are saved.
          </Alert>
        )}
        {error && (
          <Alert color="red" icon={<IconX size={18} />}>
            {error}
          </Alert>
        )}
        <Group justify="flex-end">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    const { error: deleteError } = await authClient.deleteUser({ password });
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.status === 400 || deleteError.code === "INVALID_PASSWORD" ? "That password isn't right." : (deleteError.message ?? "We couldn't delete your account."));
      return;
    }
    syncLegacySession(null);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Surface maw={720}>
      <Group justify="space-between" gap="md">
        <Text size="sm" c="dimmed" maw={420}>
          Permanently remove your account and profile. This can&apos;t be undone.
        </Text>
        <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={open}>
          Delete my account
        </Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Delete your account?">
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={18} />}>
            Your account and profile will be deleted right away, and you&apos;ll be signed out.
          </Alert>
          <PasswordInput label="Your password" description="To confirm it's you." autoComplete="current-password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} error={error} />
          <Checkbox label="I understand this can't be undone" checked={confirmed} onChange={(event) => setConfirmed(event.currentTarget.checked)} />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Keep my account
            </Button>
            <Button color="red" disabled={!password || !confirmed} loading={deleting} onClick={deleteAccount}>
              Delete my account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Surface>
  );
}
