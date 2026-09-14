import { Card, Container, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBook2 } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function AuthCard({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <Container size={440} py="xl">
      <Stack align="center" gap={6} mb="lg" ta="center">
        <ThemeIcon size={48} radius="xl" variant="light">
          <IconBook2 size={26} />
        </ThemeIcon>
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      <Card withBorder padding="xl" radius="lg">
        {children}
      </Card>
      {footer && (
        <Text ta="center" size="sm" c="dimmed" mt="md">
          {footer}
        </Text>
      )}
    </Container>
  );
}

/** Only allow same-site relative redirects. */
export function safeRedirect(value: string | null, fallback = "/"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
