"use client";

import { Alert, Button, Group, Select, Stack, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { profileSchema, type ProfileValues } from "@/lib/account-schemas/profile-schema";
import { USER_LEVEL_SELECT_DATA } from "@/lib/account-schemas/user-level-select-data";
import { errorMessage } from "@/lib/api-client/error-message";
import { authClient } from "@/lib/auth/auth-client";
import { useRequiredUser } from "@/lib/auth/use-required-user";
import { useSessionChanged } from "@/lib/auth/use-session-changed";

/** Name, user name, email and "I am a…". Saving updates the header and the Angular screens too. */
export function ProfileForm() {
  const user = useRequiredUser();
  const sessionChanged = useSessionChanged();
  const form = useForm<ProfileValues>({
    mode: "uncontrolled",
    initialValues: { name: user.name, username: user.username, email: user.email, userLevel: user.userLevel },
    validate: schemaResolver(profileSchema, { sync: true }),
    // A saved message only describes what's on screen until the next change.
    onValuesChange: () => save.reset(),
  });

  const save = useMutation({
    mutationFn: async (values: ProfileValues) => {
      if (values.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        const { error } = await authClient.changeEmail({ newEmail: values.email.trim() });
        if (error) throw new Error(error.message ?? "We couldn't change your email.");
      }
      const { error } = await authClient.updateUser({
        name: values.name.trim(),
        username: values.username.trim(),
        userLevel: values.userLevel ?? "",
      });
      if (error) {
        throw new Error(error.code?.startsWith("USERNAME_IS_ALREADY_TAKEN") ? "That user name is taken. Try another one." : (error.message ?? "We couldn't save your details."));
      }
    },
    onSuccess: (_data, values) => {
      form.resetDirty(values);
      sessionChanged();
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => save.mutate(values))}>
      {/* One field per row. */}
      <Stack gap="md">
        <TextInput label="Full name" autoComplete="name" key={form.key("name")} {...form.getInputProps("name")} />
        <TextInput label="User name" autoComplete="username" key={form.key("username")} {...form.getInputProps("username")} />
        <TextInput label="Email" type="email" autoComplete="email" key={form.key("email")} {...form.getInputProps("email")} />
        <Select label="I am a…" placeholder="Not specified" data={USER_LEVEL_SELECT_DATA} clearable allowDeselect key={form.key("userLevel")} {...form.getInputProps("userLevel")} />
        {save.isSuccess && (
          <Alert color="virsGreen" icon={<IconCheck size={18} />}>
            Your details are saved.
          </Alert>
        )}
        {save.isError && (
          <Alert color="red" icon={<IconX size={18} />}>
            {errorMessage(save.error)}
          </Alert>
        )}
        <Group justify="flex-end">
          <Button type="submit" loading={save.isPending}>
            Save changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
