"use client";

import { Box, Stack } from "@mantine/core";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { PasswordForm } from "../../_components/password-form";

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
        <Box maw={420}>
          <PasswordForm />
        </Box>
      </Surface>
    </Stack>
  );
}
