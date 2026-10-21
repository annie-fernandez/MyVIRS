"use client";

import { Button, SimpleGrid, Stack } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { Marker } from "@/components/ui/marker";
import { OptionCard } from "@/components/ui/option-card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { TEXT_SOURCES } from "@/lib/sources";

const FILE_SOURCES = [TEXT_SOURCES.doc, TEXT_SOURCES.pdf, TEXT_SOURCES.image];

export function HomeScreen() {
  return (
    <Stack gap="xl">
      {/* The one thing to do here. The old carousel's tagline ("Analyzing one word at a time") is in the description. */}
      <Surface p={{ base: "lg", sm: "xl" }}>
        <PageHeader
          title={
            <>
              What would you like to <Marker>read</Marker> today?
            </>
          }
          description="Paste a passage and VIRS analyzes it one word at a time: how common each word is in school reading, and how readable the whole text is."
          actions={
            <Button component={ShellLink} href={TEXT_SOURCES.text.href} size="lg" leftSection={<IconChartBar size={20} />}>
              Measure readability
            </Button>
          }
        />
      </Surface>

      <Section title="Have a file instead?" description="Upload it and VIRS reads the text for you.">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {FILE_SOURCES.map((source) => (
            <OptionCard key={source.href} compact href={source.href} color={source.color} icon={source.icon} title={source.short.title} description={source.short.description} />
          ))}
        </SimpleGrid>
      </Section>
    </Stack>
  );
}
