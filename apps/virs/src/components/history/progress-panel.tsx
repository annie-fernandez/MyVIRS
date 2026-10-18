"use client";

import { AreaChart } from "@mantine/charts";
import { Box, Group, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { KNOWN_RATING, LEARNING_RATING, knownWordsOverTime, wordStage, type WordProgress } from "@repo/core";
import { useMemo, useRef, type ReactNode } from "react";
import type { ProgressData } from "@/app/api/progress/route";
import { EmptyState, Surface } from "@/components/ui";
import classes from "./history.module.css";
import type { RatingFilter } from "./words-panel";

const shortDate = (value: string | Date) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
// Day keys are local dates (YYYY-MM-DD); parse them as local midnight, not UTC.
const fromDayKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
};

// Chart chrome from the dataviz rules: solid hairline grid, 2px lines, an area wash at about 10%,
// dots with a ring in the panel color so they stay legible on the line.
const GRID = { strokeDasharray: "", stroke: "var(--mantine-color-charcoal-1)" };
const DOT = { r: 4, strokeWidth: 2, stroke: "var(--virs-surface)", fillOpacity: 1 };

/** Where each headline number leads when clicked. */
export type ProgressLink = { to: "words"; rating: RatingFilter } | { to: "passages" };

/** The headline numbers (each one opens what it counts), words known over time, and the before-and-after. */
export function ProgressPanel({ data, words, onOpen }: { data: ProgressData; words: WordProgress[]; onOpen: (link: ProgressLink) => void }) {
  const known = useMemo(() => knownWordsOverTime(data.ratings), [data.ratings]);
  const improvedFigure = useRef<HTMLDivElement>(null);
  const knownNow = words.filter((word) => word.rating >= KNOWN_RATING).length;
  const improved = words.filter((word) => word.rating > word.firstRating);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatTile label="Words rated" value={words.length} hint="See all your words" onClick={() => onOpen({ to: "words", rating: "all" })} />
        <StatTile label="Words you know" value={knownNow} hint={`Rated ${KNOWN_RATING} or 5`} onClick={() => onOpen({ to: "words", rating: "known" })} />
        <StatTile
          label="Words improved"
          value={improved.length}
          hint="Rated higher than at first"
          onClick={() => improvedFigure.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
        />
        <StatTile label="Passages analyzed" value={data.analyses.length} hint="See your passages" onClick={() => onOpen({ to: "passages" })} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <ChartCard title="Words you know" description={`Words rated ${KNOWN_RATING} or higher.`}>
          {known.length === 0 ? (
            <EmptyState icon={IconChartLine} title="Rate words to see this grow" description="In an enhanced text, click a word and choose how well you know it, from 1 to 5." />
          ) : (
            <AreaChart
              h={220}
              data={known.map((point) => ({ ...point, label: shortDate(fromDayKey(point.date)) }))}
              dataKey="label"
              series={[{ name: "known", label: "Words you know", color: "virsIndigo.6" }]}
              curveType="linear"
              withGradient={false}
              fillOpacity={0.1}
              strokeWidth={2}
              withDots={known.length <= 40}
              dotProps={DOT}
              activeDotProps={{ ...DOT, r: 5 }}
              // Mantine's "x" draws the horizontal lines.
              gridAxis="x"
              gridProps={GRID}
              tickLine="none"
              yAxisProps={{ allowDecimals: false, width: 36 }}
              xAxisProps={{ minTickGap: 24 }}
            />
          )}
        </ChartCard>

        <Box ref={improvedFigure}>
          <ChartCard title="Words improved" description="Words you now rate higher than the first time.">
            <ImprovementStory words={words} improved={improved} />
          </ChartCard>
        </Box>
      </SimpleGrid>

    </Stack>
  );
}

/** How many of the biggest jumps to name. A fixed few, so the card never grows. */
const JUMPS = 3;

/**
 * Before and after, in plain terms: how many words improved, how many words the student knew at
 * first against now, and their few biggest jumps by name.
 */
function ImprovementStory({ words, improved }: { words: WordProgress[]; improved: WordProgress[] }) {
  if (words.length === 0) {
    return <EmptyState icon={IconChartLine} title="Rate words to see this" description="In an enhanced text, click a word and choose how well you know it, from 1 to 5." />;
  }
  // Students rate words they don't know yet, so "progress" means how many of the words that were
  // new to them (first rated 1–2) they now know (4–5), with the ones partway there (3) shown too.
  const startedNew = words.filter((word) => word.firstRating <= LEARNING_RATING);
  const learned = startedNew.filter((word) => word.rating >= KNOWN_RATING).length;
  const partway = startedNew.filter((word) => wordStage(word.rating) === "almost").length;
  const stillNew = startedNew.length - learned - partway;
  const jumps = [...improved]
    .sort((a, b) => b.rating - b.firstRating - (a.rating - a.firstRating) || b.ratedAt.localeCompare(a.ratedAt))
    .slice(0, JUMPS);

  return (
    <Stack gap="md">
      <Text fz={28} fw={600} lh={1.1}>
        {improved.length.toLocaleString()}{" "}
        <Text span fz="lg" fw={500}>
          {improved.length === 1 ? "word improved" : "words improved"}
        </Text>
      </Text>

      {startedNew.length > 0 && (
        <Stack gap={6}>
          <Text size="sm">
            You&apos;ve learned <b>{learned.toLocaleString()}</b> of the {startedNew.length.toLocaleString()} {startedNew.length === 1 ? "word" : "words"} that were new to you.
          </Text>
          <Box className={classes.learnTrack} role="img" aria-label={`${learned} learned, ${partway} almost there, ${stillNew} still new`}>
            <Box className={classes.learnBar} style={{ width: `${(learned / startedNew.length) * 100}%` }} />
            <Box className={classes.learnBar} data-partway style={{ width: `${(partway / startedNew.length) * 100}%` }} />
          </Box>
          <Group gap="md">
            <KeyItem variant="learned" label={`Learned ${learned}`} />
            <KeyItem variant="partway" label={`Almost there ${partway}`} />
            <KeyItem variant="track" label={`Still new ${stillNew}`} />
          </Group>
        </Stack>
      )}

      {jumps.length > 0 && (
        <div>
          <Text size="sm" fw={600} mb={4}>
            Your biggest jumps
          </Text>
          <Stack gap={2}>
            {jumps.map((word) => (
              <Group key={word.word} justify="space-between" wrap="nowrap">
                <Text size="sm" truncate>
                  {word.word}
                </Text>
                <Text size="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
                  {word.firstRating} → {word.rating}
                </Text>
              </Group>
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
}

function KeyItem({ variant, label }: { variant: "learned" | "partway" | "track"; label: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box className={classes.keySwatch} data-variant={variant} />
      <Text size="xs">{label}</Text>
    </Group>
  );
}

/** A headline number that opens what it counts. */
function StatTile({ label, value, hint, onClick }: { label: string; value: number; hint: string; onClick: () => void }) {
  return (
    <UnstyledButton onClick={onClick} className={classes.statTile}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text fw={600} fz={28} lh={1.2}>
        {value.toLocaleString()}
      </Text>
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    </UnstyledButton>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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
