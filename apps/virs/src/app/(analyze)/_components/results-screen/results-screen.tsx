"use client";

import { Button, Center, Group, Loader, SegmentedControl, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconChartBar, IconHighlight, IconPlus, IconTextScan2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DefinitionTarget } from "@/components/definition/definition-target";
import { ShellLink } from "@/components/shell-link/shell-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { useAnalysis } from "@/lib/analysis-store/use-analysis";
import { RESULT_PATH, type ResultView } from "../../_lib/result-path";
import { DefinitionDrawer } from "./definition-drawer";
import { DefinitionPanel } from "./definition-panel";
import { EnhancedText } from "./enhanced-text";
import { HistoryNote } from "./history-note";
import classes from "./results-screen.module.css";
import { Statistics } from "./statistics";

/** Narrowest page (in px) that still fits the passage and the word panel side by side, 60/40. */
const SPLIT_MIN_WIDTH = 720;

/** The Enhanced text and Statistics screens. Both read the latest analysis from this tab. */
export function ResultsScreen({ view }: { view: ResultView }) {
  const router = useRouter();
  const analysis = useAnalysis();
  const [definition, setDefinition] = useState<DefinitionTarget | null>(null);
  // Side by side when the page itself has room (its width, not the window's: the menu takes some of
  // it); otherwise the word opens in a drawer. 0 means not measured yet: start side by side.
  const content = useElementSize();
  const split = content.width === 0 || content.width >= SPLIT_MIN_WIDTH;

  // Not read from this tab's storage yet (the server render and hydration).
  if (analysis === undefined) {
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
        // One line (source · words · date), so don't hold space for a second.
        descriptionLines={1}
        actions={
          <>
            {/* A fixed width split evenly, so both halves are the same size whatever their labels. */}
            <SegmentedControl
              w={320}
              maw="100%"
              fullWidth
              value={view}
              onChange={(next) => router.push(RESULT_PATH[next as ResultView])}
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
        <div ref={content.ref} className={split ? classes.split : undefined}>
          <EnhancedText result={result} onWord={(target) => setDefinition({ ...target, analysisId: historyId ?? null })} />
          {split ? <DefinitionPanel target={definition} /> : <DefinitionDrawer target={definition} onClose={() => setDefinition(null)} />}
        </div>
      ) : (
        <Statistics result={result} />
      )}
    </Stack>
  );
}
