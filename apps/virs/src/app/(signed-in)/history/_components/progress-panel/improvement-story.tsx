"use client";

import { Box, Group, Stack, Text } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { KNOWN_RATING, LEARNING_RATING, wordStage, type WordProgress } from "@repo/core";
import { EmptyState } from "@/components/ui/empty-state";
import classes from "./improvement-story.module.css";
import { KeyItem } from "./key-item";

/** How many of the biggest jumps to name. A fixed few, so the card never grows. */
const JUMPS = 3;

/**
 * Before and after, in plain terms: how many words improved, how many words the student knew at
 * first against now, and their few biggest jumps by name.
 */
export function ImprovementStory({ words, improved }: { words: WordProgress[]; improved: WordProgress[] }) {
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
