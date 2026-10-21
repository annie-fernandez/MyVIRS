"use client";

import { Accordion, Group, Progress, RingProgress, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { READING_LEVEL_LABELS, readingLevel, type AnalysisResult, type ReadingLevel } from "@repo/core";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { CATEGORY_KEYS } from "@/lib/categories/category-keys";
import { categoryLabel } from "@/lib/categories/category-label";
import { CATEGORY_STYLES } from "@/theme/category-styles";
import type { VirsColor } from "@/theme/virs-colors";
import { percent } from "./percent";

const LEVEL_COLORS: Record<ReadingLevel, VirsColor> = {
  beginner: "virsGreen",
  intermediate: "virsBlue",
  "upper-intermediate": "virsGold",
  advanced: "virsOrange",
  college: "virsPink",
  "too-short": "charcoal",
  "needs-more-sentences": "charcoal",
};

const LEVEL_EXPLANATIONS = [
  { level: "Beginner (80–100)", body: "For readers who may struggle with new vocabulary. Uncommon words should be introduced or defined, and new ideas may need pictures." },
  { level: "Intermediate (70–79)", body: "For readers who can work out new words from context. Sentences are more varied and harder words are often not explained." },
  { level: "Upper intermediate (60–69)", body: "Between intermediate and advanced: more varied sentences and less common words, still readable without subject knowledge." },
  { level: "Advanced (30–59)", body: "Relies on background knowledge and more specialized vocabulary. Some subject words are used without explanation." },
  { level: "College (0–29)", body: "Dense and subject-specific. Specialized words are used throughout, and precision comes before ease of reading." },
];

/** The readability score, word counts and each list's share of the text. */
export function Statistics({ result }: { result: AnalysisResult }) {
  const { wordCount, wordPercentage } = result.statistics;
  const score = result.fleschReadingScore;
  const level = readingLevel(score, wordCount.total);
  const scored = level !== "too-short" && level !== "needs-more-sentences";
  const rows = CATEGORY_KEYS.filter((key) => wordCount[key] > 0);
  const maxCount = Math.max(1, ...rows.map((key) => wordCount[key]));
  const onList = wordCount.total === 0 ? 0 : 1 - wordPercentage.offList;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Surface>
          <Text size="sm" c="dimmed" mb="xs">
            Readability score
          </Text>
          {scored ? (
            <Group wrap="nowrap" gap="md">
              <RingProgress
                size={92}
                thickness={10}
                roundCaps
                sections={[{ value: Math.min(100, Math.max(0, score)), color: LEVEL_COLORS[level] }]}
                label={
                  <Text ta="center" fw={600} fz="xl">
                    {score.toFixed(0)}
                  </Text>
                }
              />
              <div>
                <Text fw={600} fz="lg" c={`${LEVEL_COLORS[level]}.8`}>
                  {READING_LEVEL_LABELS[level]}
                </Text>
                <Text size="sm" c="dimmed">
                  Higher is easier to read.
                </Text>
              </div>
            </Group>
          ) : (
            <>
              <Text fw={600} fz="lg">
                {READING_LEVEL_LABELS[level]}
              </Text>
              <Text size="sm" c="dimmed">
                {level === "too-short"
                  ? `This text has ${wordCount.total.toLocaleString()}. The word lists below still apply.`
                  : "Break it into sentences with full stops to get a score. The word lists below still apply."}
              </Text>
            </>
          )}
        </Surface>
        <Surface>
          <Text size="sm" c="dimmed">
            Words
          </Text>
          <Title order={2} fz={28}>
            {wordCount.total.toLocaleString()}
          </Title>
          <Text size="sm" c="dimmed" mt="sm">
            in {result.sentenceCount.toLocaleString()} {result.sentenceCount === 1 ? "sentence" : "sentences"}
          </Text>
        </Surface>
        <Surface>
          <Text size="sm" c="dimmed">
            Found in a word list
          </Text>
          <Title order={2} fz={28}>
            {percent(onList)}
          </Title>
          <Text size="sm" c="dimmed" mt="sm">
            {wordCount.offList.toLocaleString()} {wordCount.offList === 1 ? "name or off-list word" : "names and off-list words"}
          </Text>
        </Surface>
      </SimpleGrid>

      {/* Side by side on wide screens: the bars to compare at a glance, the table for the exact numbers. */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" style={{ alignItems: "start" }}>
        <Section title="Words per list">
          <Surface>
            <Stack gap="md">
              {rows.map((key) => (
                <div key={key}>
                  <Group justify="space-between" mb={6}>
                    <Group gap={8}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: CATEGORY_STYLES[key].text }} />
                      <Text size="sm" fw={500}>
                        {categoryLabel(key)}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {wordCount[key].toLocaleString()} · {percent(wordPercentage[key])}
                    </Text>
                  </Group>
                  <Progress
                    value={(wordCount[key] / maxCount) * 100}
                    color={CATEGORY_STYLES[key].text}
                    size="md"
                    aria-label={`${categoryLabel(key)}: ${wordCount[key]} words`}
                  />
                </div>
              ))}
            </Stack>
          </Surface>
        </Section>

        <Section title="Every list">
          <Surface p={0} style={{ overflowX: "auto" }}>
            <Table miw={420}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Word list</Table.Th>
                  <Table.Th ta="right">Words</Table.Th>
                  <Table.Th ta="right">Share</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {CATEGORY_KEYS.map((key) => (
                  <Table.Tr key={key} c={wordCount[key] === 0 ? "dimmed" : undefined}>
                    <Table.Td>
                      <Group gap={8} wrap="nowrap">
                        <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: CATEGORY_STYLES[key].text }} />
                        {categoryLabel(key)}
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">{wordCount[key].toLocaleString()}</Table.Td>
                    <Table.Td ta="right">{percent(wordPercentage[key])}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th>Total</Table.Th>
                  <Table.Th ta="right">{wordCount.total.toLocaleString()}</Table.Th>
                  <Table.Th ta="right">100%</Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Surface>
        </Section>
      </SimpleGrid>

      <Accordion>
        <Accordion.Item value="levels">
          <Accordion.Control>What do the readability levels mean?</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              {LEVEL_EXPLANATIONS.map((item) => (
                <div key={item.level}>
                  <Text fw={600}>{item.level}</Text>
                  <Text size="sm" c="dimmed">
                    {item.body}
                  </Text>
                </div>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
