"use client";

import { Button, Checkbox, Flex, Group, Modal, PasswordInput, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { errorMessage } from "@/lib/api-client/error-message";
import { authClient } from "@/lib/auth/auth-client";
import { AuthError } from "@/lib/auth/auth-error";
import { useSignOut } from "@/lib/auth/use-sign-out";

/** Deletes the account after the password and a confirmation, then signs out. */
export function DeleteAccount() {
  const router = useRouter();
  const signOut = useSignOut();
  const [opened, { open, close }] = useDisclosure(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const deleteAccount = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await authClient.deleteUser({ password });
      if (error) throw AuthError.from(error);
    },
    onSuccess: () => {
      // Leave this page first: once signed out, it would send the visitor to the sign-in page.
      router.push("/dashboard");
      signOut.mutate();
    },
  });
  const wrongPassword = deleteAccount.error instanceof AuthError && (deleteAccount.error.status === 400 || deleteAccount.error.code === "INVALID_PASSWORD");
  const error = deleteAccount.isError ? (wrongPassword ? "That password isn't right." : errorMessage(deleteAccount.error)) : null;

  return (
    <>
      {/* What it removes is said above this, in the tab. */}
      <Group>
        <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={open}>
          Delete my account
        </Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Delete your account?" size="md" centered>
        <Stack gap="lg">
          {/* The same list as the tab, so the pop-up names everything that goes (DESIGN.md). */}
          <Text>
            Your account, your history and your word ratings will be deleted right away, and you&apos;ll be signed out. This can&apos;t be undone.
          </Text>
          <PasswordInput label="Enter your password to confirm" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} error={error} data-autofocus />
          <Checkbox label="I understand this can't be undone" checked={confirmed} onChange={(event) => setConfirmed(event.currentTarget.checked)} />
          {/* No "Keep my account": closing the pop-up keeps it. On the right, or full width on a phone. */}
          <Flex direction={{ base: "column", xs: "row" }} justify="flex-end">
            <Button color="red" disabled={!password || !confirmed} loading={deleteAccount.isPending} onClick={() => deleteAccount.mutate(password)}>
              Delete my account
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
}
