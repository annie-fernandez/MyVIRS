"use client";

import { Stack, Tabs } from "@mantine/core";
import { useState } from "react";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import type { RatingFilter } from "../_lib/rating-filter";
import { HistoryList } from "./history-list/history-list";
import classes from "./history-screen.module.css";
import { ProgressGate } from "./progress-gate";
import { ProgressPanel } from "./progress-panel/progress-panel";
import { WordsPanel } from "./words-panel/words-panel";

/** The three tabs share one width, whatever their labels. */
const TAB_WIDTH = 140;

/** The signed-in user's progress, rated words and saved analyses. */
export function HistoryScreen() {
  const [tab, setTab] = useState<string>("progress");
  const [wordsRating, setWordsRating] = useState<RatingFilter>("all");

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Your <Marker>history</Marker>
          </>
        }
        description="Your words, your progress and your saved passages."
        descriptionLines={1}
      />
      <Tabs value={tab} onChange={(value) => value && setTab(value)} keepMounted={false}>
        <Tabs.List mb="lg" aria-label="History sections">
          <Tabs.Tab value="progress" w={TAB_WIDTH} className={classes.tab}>
            Progress
          </Tabs.Tab>
          <Tabs.Tab value="words" w={TAB_WIDTH} className={classes.tab}>
            Your words
          </Tabs.Tab>
          <Tabs.Tab value="passages" w={TAB_WIDTH} className={classes.tab}>
            Passages
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="progress">
          <ProgressGate>
            {(progress) => (
              <ProgressPanel
                data={progress}
                words={progress.words}
                onOpen={(link) => {
                  if (link.to === "words") setWordsRating(link.rating);
                  setTab(link.to);
                }}
              />
            )}
          </ProgressGate>
        </Tabs.Panel>
        <Tabs.Panel value="words">
          <ProgressGate>{(progress) => <WordsPanel words={progress.words} rating={wordsRating} onRatingChange={setWordsRating} />}</ProgressGate>
        </Tabs.Panel>
        <Tabs.Panel value="passages">
          <HistoryList />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
