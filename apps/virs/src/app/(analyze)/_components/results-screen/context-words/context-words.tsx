"use client";

import { Alert, Skeleton, Stack, Text } from "@mantine/core";
import { normalizeWord, type AnalysisResult } from "@repo/core";
import { IconBooks, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { errorMessage } from "@/lib/api-client/error-message";
import { contextPassageQuery } from "../../../_lib/context-passage-query";
import { compareRanks } from "./compare-ranks";
import { WordComparisonTable } from "./word-comparison-table";

// Team A's only list so far. When they send more, this becomes a choice, as on Analysis by context.
const LIST_ID = "ck12-biology";

/**
 * The passage's words in the two orders Team A compares, by context and by frequency, in one table.
 * The ranks are the whole book's: each word is looked up there, the passage itself isn't ranked.
 */
export function ContextWords({ result, analyzedAt }: { result: AnalysisResult; analyzedAt: string }) {
  // Times the passage uses each word, written the way the list's forms are matched.
  const counts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { initialValue } of result.words) {
      const word = normalizeWord(initialValue);
      if (word) counts[word] = (counts[word] ?? 0) + 1;
    }
    return counts;
  }, [result]);

  const match = useQuery(contextPassageQuery(LIST_ID, analyzedAt, counts));
  const words = useMemo(() => compareRanks(match.data?.words ?? []), [match.data]);

  if (match.isError) {
    return (
      <Alert color="red" icon={<IconX size={18} />} title="We couldn't look up your words">
        {errorMessage(match.error)}
      </Alert>
    );
  }

  if (match.isPending) return <Skeleton height={480} radius="lg" />;

  const { list } = match.data;

  if (words.length === 0) {
    return (
      <EmptyState
        icon={IconBooks}
        title={`None of your words are in ${list.title}`}
        description="This ranking only knows the words its textbook uses. Try a biology passage."
      />
    );
  }

  return (
    <Stack gap="md">
      <Text c="dimmed" maw={640}>
        Your words ranked by context: the ones that matter most in {list.title} come first.
      </Text>
      <WordComparisonTable words={words} />
    </Stack>
  );
}
