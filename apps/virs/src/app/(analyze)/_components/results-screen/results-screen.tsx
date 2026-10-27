"use client";

import { Box, Button, Center, Group, Loader, Stack, Tabs } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconAffiliate, IconChartBar, IconHighlight, IconPlus, IconTextScan2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
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

const VIEWS: Record<ResultView, { text: string; title: ReactNode; tab: string; icon: typeof IconHighlight }> = {
  enhanced: { text: "Enhanced text", title: <>Enhanced <Marker>text</Marker></>, tab: "Enhanced text", icon: IconHighlight },
  statistics: { text: "Text statistics", title: <>Text <Marker>statistics</Marker></>, tab: "Statistics", icon: IconChartBar },
  context: { text: "Words by context", title: <>Words by <Marker>context</Marker></>, tab: "By context", icon: IconAffiliate },
};

/** The Enhanced text, Statistics and Context screens. All read the latest analysis from this tab. */
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
        <PageHeader title={VIEWS[view].text} />
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

  const header = (
    <>
      <PageHeader
        title={VIEWS[view].title}
        description={`${source} · ${total.toLocaleString()} ${total === 1 ? "word" : "words"} · analyzed ${new Date(analyzedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
        // One line (source · words · date), so don't hold space for a second.
        descriptionLines={1}
        actions={
          <Button component={ShellLink} href="/text" variant="default" leftSection={<IconPlus size={16} />}>
            Analyze another
          </Button>
        }
      />

      {/* Links between the three results, as tabs: each is its own page, so this only changes the address. */}
      <Tabs value={view} onChange={(next) => next && router.push(RESULT_PATH[next as ResultView])}>
        <Tabs.List aria-label="Results" className={classes.tabList}>
          {(Object.keys(VIEWS) as ResultView[]).map((key) => {
            const { tab, icon: TabIcon } = VIEWS[key];
            return (
              <Tabs.Tab key={key} value={key} px={{ base: 4, sm: "md" }} className={classes.tab}>
                <Group gap={8} justify="center" wrap="nowrap">
                  {/* No icons on phones, as on the Analyze tabs, so the three labels fit. */}
                  <Box component="span" visibleFrom="sm" lh={0}>
                    <TabIcon size={16} />
                  </Box>
                  {tab}
                </Group>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      <HistoryNote saved={Boolean(historyId)} />
    </>
  );

  const onWord = (target: DefinitionTarget) => setDefinition({ ...target, analysisId: historyId ?? null });
  const sideBySide = view === "enhanced" && split;

  // One measured wrapper whatever the layout, so the width keeps being watched when it changes.
  return (
    <div ref={content.ref} className={sideBySide ? classes.split : undefined}>
      {sideBySide ? (
        // The word panel is its own column from the top of the page, level with the title: all of it
        // is on screen from the start, so it never has to be scrolled into place.
        <>
          <Stack gap="xl">
            {header}
            <EnhancedText result={result} onWord={onWord} />
          </Stack>
          <DefinitionPanel target={definition} />
        </>
      ) : (
        <Stack gap="xl">
          {header}
          {view === "enhanced" ? (
            <>
              <EnhancedText result={result} onWord={onWord} />
              <DefinitionDrawer target={definition} onClose={() => setDefinition(null)} />
            </>
          ) : view === "statistics" ? (
            <Statistics result={result} />
          ) : (
            // The comparison by context is stashed while it's reworked (git stash list: "By context tab").
            <EmptyState icon={IconAffiliate} title="To be implemented" description="Comparing your words by context and by frequency is coming soon." />
          )}
        </Stack>
      )}
    </div>
  );
}
