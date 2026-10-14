"use client";

import { Button, Checkbox, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { CATEGORY_INFO, WORD_CATEGORIES, type WordCategory } from "@repo/core";
import { useState } from "react";
import { Marker, PageHeader, Section, Surface } from "@/components/ui";
import { CATEGORY_STYLES } from "@/theme";

const PRESETS: { label: string; categories: WordCategory[] }[] = [
  { label: "K1–K3", categories: ["k1", "k2", "k3"] },
  { label: "Academic and STEM", categories: ["awl", "baw", "stem"] },
  { label: "Every list", categories: [...WORD_CATEGORIES] },
];

function exportHref(categories: WordCategory[]) {
  return `/api/words/export?categories=${categories.join(",")}`;
}

export function DownloadScreen() {
  const [selected, setSelected] = useState<string[]>(["k1"]);
  const chosen = WORD_CATEGORIES.filter((category) => selected.includes(category));

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Download word <Marker>lists</Marker>
          </>
        }
        description="Choose one or more lists and download them as a CSV file with each word, its list and its grade. It opens in Excel, Numbers or Google Sheets."
      />

      <Surface>
        <Stack gap="md">
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Quick picks:
            </Text>
            {PRESETS.map((preset) => (
              <Button key={preset.label} variant="light" color="virsOrange" size="compact-sm" onClick={() => setSelected(preset.categories)}>
                {preset.label}
              </Button>
            ))}
          </Group>

          <Checkbox.Group value={selected} onChange={setSelected} label="Lists to download">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="xs">
              {WORD_CATEGORIES.map((category) => (
                <Checkbox
                  key={category}
                  value={category}
                  color={CATEGORY_STYLES[category].text}
                  label={
                    <Text span fw={500} c={CATEGORY_STYLES[category].text}>
                      {CATEGORY_INFO[category].label}
                    </Text>
                  }
                  description={CATEGORY_INFO[category].description}
                />
              ))}
            </SimpleGrid>
          </Checkbox.Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {chosen.length === 0 ? "Choose at least one list." : `${chosen.length} ${chosen.length === 1 ? "list" : "lists"} selected.`}
            </Text>
            <Button
              component="a"
              href={chosen.length ? exportHref(chosen) : undefined}
              data-disabled={chosen.length === 0 || undefined}
              disabled={chosen.length === 0}
              leftSection={<IconDownload size={16} />}
            >
              Download CSV
            </Button>
          </Group>
        </Stack>
      </Surface>

      <Section title="What's in the file" description="One row per word and list. A word in two lists appears twice; the grade is empty when a word has none.">
        <Surface>
          <Text size="sm" ff="monospace">
            value,category,grade
            <br />
            water,k1,K
            <br />
            ability,k1,
          </Text>
        </Surface>
      </Section>
    </Stack>
  );
}
