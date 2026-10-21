"use client";

import { SimpleGrid, Stack } from "@mantine/core";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { useRequiredUser } from "@/lib/auth/use-required-user";
import { PasswordForm } from "../../_components/password-form";
import { DeleteAccount } from "./delete-account";
import { ProfileForm } from "./profile-form";

/** The signed-in user's profile, password and account deletion. */
export function AccountScreen() {
  const user = useRequiredUser();
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
      {/* Side by side on wide screens: the details and the password are separate forms. */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" style={{ alignItems: "start" }}>
        <Section title="Your details">
          <Surface>
            <ProfileForm />
          </Surface>
        </Section>
        <Section title="Password">
          <Surface>
            <PasswordForm />
          </Surface>
        </Section>
      </SimpleGrid>
      <Section title="Delete account">
        <DeleteAccount />
      </Section>
    </Stack>
  );
}
