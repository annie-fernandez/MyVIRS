import { Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="xl" gap="md">
      <Group gap="md" align="flex-start" wrap="nowrap">
        {icon && (
          <ThemeIcon size={44} radius="md" variant="light">
            {icon}
          </ThemeIcon>
        )}
        <Stack gap={4}>
          <Title order={2}>{title}</Title>
          {description && (
            <Text c="dimmed" maw={640}>
              {description}
            </Text>
          )}
        </Stack>
      </Group>
      {actions && <Group gap="xs">{actions}</Group>}
    </Group>
  );
}
