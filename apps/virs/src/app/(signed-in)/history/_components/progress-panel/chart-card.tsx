import { Text, Title } from "@mantine/core";
import type { ReactNode } from "react";
import { Surface } from "@/components/ui/surface";

/** A titled card around one chart on the Progress tab. */
export function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Surface h="100%">
      <Title order={3} fz="md" mb={4}>
        {title}
      </Title>
      <Text size="sm" c="dimmed" mb="md" maw={520}>
        {description}
      </Text>
      {children}
    </Surface>
  );
}
