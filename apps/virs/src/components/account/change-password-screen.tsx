"use client";

import { Stack } from "@mantine/core";
import { Marker, PageHeader, Surface } from "@/components/ui";
import { PasswordForm } from "./password-form";

export function ChangePasswordScreen() {
  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Change your <Marker>password</Marker>
          </>
        }
        description="Enter your current password, then choose a new one."
      />
      <Surface maw={640}>
        <PasswordForm />
      </Surface>
    </Stack>
  );
}
