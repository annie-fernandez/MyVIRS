"use client";

import { AreaChart } from "@mantine/charts";
import { Box, SimpleGrid, Stack } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { KNOWN_RATING, knownWordsOverTime, type ProgressData, type WordProgress } from "@repo/core";
import { useMemo, useRef } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import type { RatingFilter } from "../../_lib/rating-filter";
import { shortDate } from "../../_lib/short-date";
import { ChartCard } from "./chart-card";
import { fromDayKey } from "./from-day-key";
import { ImprovementStory } from "./improvement-story";
import { StatTile } from "./stat-tile";

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
