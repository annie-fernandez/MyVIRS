"use client";

import {
  Accordion,
  Alert,
  Anchor,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Progress,
  RingProgress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconChartBar, IconCheck, IconHighlight, IconInfoCircle, IconPlus, IconTextScan2 } from "@tabler/icons-react";
import { READING_LEVEL_LABELS, readingLevel, sentenceAround, type AnalysisResult, type ReadingLevel, type WordMatch } from "@repo/core";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { ShellLink } from "@/components/layout/shell-link";
import { CategoryLegend, EmptyState, Marker, PageHeader, Section, Surface, WordTag } from "@/components/ui";
import { useAnalysis } from "@/lib/analysis-store";
import { authClient } from "@/lib/auth-client";
import { CATEGORY_KEYS, categoryDescription, categoryLabel } from "@/lib/categories";
import { CATEGORY_STYLES, type CategoryKey, type VirsColor } from "@/theme";
import classes from "./analysis.module.css";
import { DefinitionModal, type DefinitionTarget } from "./definition-modal";

type View = "enhanced" | "statistics";

const VIEW_PATH: Record<View, Route> = { enhanced: "/enhanced-text-result", statistics: "/text-statistics" };

/** Words rendered at first; very long documents reveal the rest on request. */
const PAGE_SIZE = 2_000;

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

const percent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`;

function categoryOf(word: WordMatch): CategoryKey {
  return word.category ?? "offList";
}

/** Splits the flat token list on paragraph markers, keeping each token's position. */
function toParagraphs(words: WordMatch[]): { word: WordMatch; index: number }[][] {
  const paragraphs: { word: WordMatch; index: number }[][] = [[]];
  words.forEach((word, index) => {
    if (word.initialValue === "") paragraphs.push([]);
    else paragraphs[paragraphs.length - 1]!.push({ word, index });
  });
  return paragraphs.filter((paragraph) => paragraph.length > 0);
}

/** The Enhanced text and Statistics screens. Both read the latest analysis from this tab. */
export function ResultsScreen({ view }: { view: View }) {
  const router = useRouter();
  const { analysis, hydrated } = useAnalysis();
  const [definition, setDefinition] = useState<DefinitionTarget | null>(null);

  if (!hydrated) {
    return (
      <Center h={240}>
        <Loader />
      </Center>
    );
  }

  if (!analysis) {
    return (
      <Stack gap="xl">
        <PageHeader title={view === "enhanced" ? "Enhanced text" : "Text statistics"} />
        <EmptyState
          icon={IconTextScan2}
          title="Nothing analyzed yet"
          description="Analyze a passage or upload a file, and its results show up here."
          action={
            <Button component={ShellLink} href="/text" leftSection={<IconPlus size={16} />}>
              Analyze a text
            </Button>
          }
        />
      </Stack>
    );
  }

  const { result, source, analyzedAt, historyId } = analysis;
  const total = result.statistics.wordCount.total;

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          view === "enhanced" ? (
            <>
              Enhanced <Marker>text</Marker>
            </>
          ) : (
            <>
              Text <Marker>statistics</Marker>
            </>
          )
        }
        description={`${source} · ${total.toLocaleString()} ${total === 1 ? "word" : "words"} · analyzed ${new Date(analyzedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
        actions={
          <>
            {/* A fixed width split evenly, so both halves are the same size whatever their labels. */}
            <SegmentedControl
              w={320}
              maw="100%"
              fullWidth
              value={view}
              onChange={(next) => router.push(VIEW_PATH[next as View])}
              data={[
                { value: "enhanced", label: <Group gap={6} wrap="nowrap" justify="center"><IconHighlight size={16} />Enhanced text</Group> },
                { value: "statistics", label: <Group gap={6} wrap="nowrap" justify="center"><IconChartBar size={16} />Statistics</Group> },
              ]}
            />
            <Button component={ShellLink} href="/text" variant="default" leftSection={<IconPlus size={16} />}>
              Analyze another
            </Button>
          </>
        }
      />

      <HistoryNote saved={Boolean(historyId)} />

      {view === "enhanced" ? (
        <EnhancedText
          result={result}
          onWord={(target) => setDefinition({ ...target, analysisId: historyId ?? null })}
        />
      ) : (
        <Statistics result={result} />
      )}

      <DefinitionModal target={definition} onClose={() => setDefinition(null)} />
    </Stack>
  );
}

/** Confirms that this analysis is in the signed-in user's history. Shows nothing otherwise. */
function HistoryNote({ saved }: { saved: boolean }) {
  const { data: session } = authClient.useSession();
  if (!saved || !session) return null;
  return (
    <Group gap={6} c="dimmed">
      <IconCheck size={16} />
      <Text size="sm">
        Saved to{" "}
        <Anchor component={ShellLink} href="/history" inherit>
          your history
        </Anchor>
        .
      </Text>
    </Group>
  );
}

function EnhancedText({
  result,
  onWord,
}: {
  result: AnalysisResult;
  onWord: (target: DefinitionTarget) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [listCategory, setListCategory] = useState<CategoryKey | null>(null);
  const paragraphs = useMemo(() => toParagraphs(result.words), [result.words]);
  const counts = result.statistics.wordCount;
  const present = CATEGORY_KEYS.filter((key) => counts[key] > 0);

  const wordsByCategory = useMemo(() => {
    const map = new Map<CategoryKey, string[]>();
    for (const key of CATEGORY_KEYS) map.set(key, []);
    const seen = new Set<string>();
    for (const word of result.words) {
      if (!word.initialValue) continue;
      const key = categoryOf(word);
      const value = (word.value ?? word.initialValue.replace(/[^\p{L}\p{N}'-]/gu, "")).toLowerCase();
      if (!value || seen.has(`${key}:${value}`)) continue;
      seen.add(`${key}:${value}`);
      map.get(key)!.push(value);
    }
    for (const list of map.values()) list.sort((a, b) => a.localeCompare(b));
    return map;
  }, [result.words]);

  return (
    <Stack gap="lg">
      {/* One sheet: the key to the colors at the top, the passage under it. */}
      <Surface p={{ base: "md", sm: "xl" }}>
        <Stack gap="xs" className={classes.key}>
          <CategoryLegend categories={present} counts={counts} onSelect={setListCategory} />
          <Text size="sm" c="dimmed">
            Each color is a word list. Click a list to see its words, or click any word for its definition.
          </Text>
        </Stack>
        <div className={classes.reading}>
          {paragraphs.map((paragraph, paragraphIndex) =>
            paragraph[0]!.index >= visibleCount ? null : (
              <p key={paragraphIndex} className={classes.paragraph}>
                {paragraph.map(({ word, index }) =>
                  index >= visibleCount ? null : (
                    <Fragment key={index}>
                      <WordTag variant="inline" category={categoryOf(word)} onClick={() => onWord({ word: word.value ?? word.initialValue, category: categoryOf(word), context: sentenceAround(result.words, index) })}>
                        {word.initialValue}
                      </WordTag>{" "}
                    </Fragment>
                  ),
                )}
              </p>
            ),
          )}
        </div>
        {visibleCount < result.words.length && (
          <Center mt="lg">
            <Button variant="default" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              Show more of the text
            </Button>
          </Center>
        )}
      </Surface>

      <Modal
        opened={listCategory !== null}
        onClose={() => setListCategory(null)}
        size="lg"
        title={
          listCategory && (
            <Stack gap={2}>
              <Text fw={600} fz="lg">
                {categoryLabel(listCategory)} words in this text
              </Text>
              <Text size="sm" c="dimmed">
                {categoryDescription(listCategory)}
              </Text>
            </Stack>
          )
        }
      >
        {listCategory && (
          <Group gap={6}>
            {wordsByCategory.get(listCategory)!.map((value) => (
              <WordTag key={value} category={listCategory} onClick={() => onWord({ word: value, category: listCategory })}>
                {value}
              </WordTag>
            ))}
          </Group>
        )}
      </Modal>
    </Stack>
  );
}

function Statistics({ result }: { result: AnalysisResult }) {
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
            <Text size="sm">{READING_LEVEL_LABELS[level]}.</Text>
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
            {wordCount.offList.toLocaleString()} names and off-list words
          </Text>
        </Surface>
      </SimpleGrid>

      {!scored && (
        <Alert color="virsBlue" icon={<IconInfoCircle size={18} />}>
          The readability score needs at least 100 words in several sentences. The word-list breakdown below still applies.
        </Alert>
      )}

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
