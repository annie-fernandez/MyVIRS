"use client";

import {
  Accordion,
  Card,
  Center,
  ColorSwatch,
  Group,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
  type MantineColor,
} from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { READING_LEVEL_LABELS, readingLevel, type AnalysisResult, type ReadingLevel } from "@repo/core";
import { CATEGORY_COLORS, CATEGORY_KEYS, categoryLabel } from "@/lib/categories-ui";

const LEVEL_COLORS: Record<ReadingLevel, MantineColor> = {
  beginner: "blue",
  intermediate: "green",
  "upper-intermediate": "yellow",
  advanced: "orange",
  college: "red",
  "too-short": "gray",
  "needs-more-sentences": "gray",
};

const LEVEL_EXPLANATIONS = [
  {
    level: "Beginner (80–100)",
    body: "For readers who may struggle with pronunciation and comprehension when they meet new vocabulary. Uncommon words should be introduced or defined, and new concepts may rely on pictures.",
  },
  {
    level: "Intermediate (70–79)",
    body: "For readers who can infer new vocabulary from context. Sentence structures are more varied and harder words are often not explained, but jargon always is.",
  },
  {
    level: "Upper intermediate (60–69)",
    body: "A step between intermediate and advanced: more varied sentences and less-common vocabulary, still accessible without subject expertise.",
  },
  {
    level: "Advanced (30–59)",
    body: "Depends on background knowledge and more specialized vocabulary. Some subject-specific jargon is used without explanation.",
  },
  {
    level: "College (0–29)",
    body: "Highly subject-specific and dense. Jargon is used extensively and readability is often sacrificed for precision.",
  },
];

const percent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`;

export function StatisticsPanel({ result }: { result: AnalysisResult }) {
  const { wordCount, wordPercentage } = result.statistics;
  const score = result.fleschReadingScore;
  const level = readingLevel(score, wordCount.total);
  const onListFraction = wordCount.total === 0 ? 0 : 1 - wordPercentage.offList;
  const rows = CATEGORY_KEYS.filter((key) => wordCount[key] > 0);
  const maxCount = Math.max(1, ...rows.map((key) => wordCount[key]));

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card withBorder padding="lg">
          <Group wrap="nowrap" gap="lg">
            <RingProgress
              size={120}
              thickness={12}
              roundCaps
              sections={[{ value: score, color: LEVEL_COLORS[level] }]}
              label={
                <Text ta="center" fw={700} size="xl">
                  {score.toFixed(0)}
                </Text>
              }
            />
            <Stack gap={6}>
              <Text size="sm" c="dimmed">
                Flesch reading ease
              </Text>
              <Text fw={700} size="lg" lh={1.2} style={{ color: `var(--mantine-color-${LEVEL_COLORS[level]}-text)` }}>
                {READING_LEVEL_LABELS[level]}
              </Text>
              <Text size="xs" c="dimmed">
                Higher scores are easier to read.
              </Text>
            </Stack>
          </Group>
        </Card>
        <Card withBorder padding="lg">
          <Text size="sm" c="dimmed">
            Words
          </Text>
          <Title order={2}>{wordCount.total.toLocaleString("en-US")}</Title>
          <Text size="sm" c="dimmed" mt="md">
            Sentences
          </Text>
          <Title order={3}>{result.sentenceCount.toLocaleString("en-US")}</Title>
        </Card>
        <Card withBorder padding="lg">
          <Text size="sm" c="dimmed">
            Words found in a word list
          </Text>
          <Title order={2}>{percent(onListFraction)}</Title>
          <Text size="sm" c="dimmed" mt="md">
            Names &amp; off-list words
          </Text>
          <Title order={3}>{wordCount.offList.toLocaleString("en-US")}</Title>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="lg">
          <Title order={4} mb="md">
            Words per list
          </Title>
          <Stack gap="md">
            {rows.map((key) => (
              <div key={key}>
                <Group justify="space-between" mb={6}>
                  <Text size="sm" fw={500}>
                    {categoryLabel(key)}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {wordCount[key].toLocaleString("en-US")} · {percent(wordPercentage[key])}
                  </Text>
                </Group>
                <Progress
                  value={(wordCount[key] / maxCount) * 100}
                  color={CATEGORY_COLORS[key]}
                  size="lg"
                  radius="xl"
                  aria-label={`${categoryLabel(key)}: ${wordCount[key]} words`}
                />
              </div>
            ))}
          </Stack>
        </Card>
        <Card withBorder padding="lg">
          <Title order={4} mb="md">
            Share of the text
          </Title>
          <Center>
            <DonutChart
              data={rows.map((key) => ({
                name: categoryLabel(key),
                value: Number((wordPercentage[key] * 100).toFixed(2)),
                color: `${CATEGORY_COLORS[key]}.6`,
              }))}
              valueFormatter={(value) => `${value}%`}
              withLabelsLine={false}
              withLegend
              size={200}
              thickness={32}
              chartLabel={`${wordCount.total.toLocaleString("en-US")} words`}
            />
          </Center>
        </Card>
      </SimpleGrid>

      <Card withBorder padding={0}>
        <Table.ScrollContainer minWidth={420}>
          <Table verticalSpacing="sm" horizontalSpacing="lg" striped highlightOnHover>
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
                    <Group gap="sm" wrap="nowrap">
                      <ColorSwatch color={`var(--mantine-color-${CATEGORY_COLORS[key]}-6)`} size={14} />
                      {categoryLabel(key)}
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">{wordCount[key].toLocaleString("en-US")}</Table.Td>
                  <Table.Td ta="right">{percent(wordPercentage[key])}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>Total</Table.Th>
                <Table.Th ta="right">{wordCount.total.toLocaleString("en-US")}</Table.Th>
                <Table.Th ta="right">100%</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      </Card>

      <Accordion variant="separated">
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
              <Text size="sm" c="dimmed">
                The score is only calculated for texts of at least 100 words.
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
