"use client";

import { Box, VisuallyHidden } from "@mantine/core";
import { IconClick } from "@tabler/icons-react";
import { DefinitionDetails } from "@/components/definition/definition-details";
import type { DefinitionTarget } from "@/components/definition/definition-target";
import { DefinitionTitle } from "@/components/definition/definition-title";
import { useWordTrail } from "@/components/definition/use-word-trail";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import classes from "./results-screen.module.css";

/**
 * Beside the enhanced text: the clicked word's rating and definition, so the passage stays in view.
 * It floats at the top of the window while the passage scrolls, and scrolls on its own.
 */
export function DefinitionPanel({ target }: { target: DefinitionTarget | null }) {
  const { shown, previous, open, back } = useWordTrail(target);
  return (
    <Box className={classes.panel}>
      {/* The panel changes beside the passage without moving focus; screen readers hear which word it now shows. */}
      <VisuallyHidden aria-live="polite">{shown ? `Showing the definition of ${shown.word}.` : ""}</VisuallyHidden>
      {shown ? (
        // Keyed by word, so a new word starts at the top of the card rather than where the last one was scrolled.
        <Surface key={shown.word} className={classes.panelCard}>
          <Box mb="md">
            <DefinitionTitle target={shown} backTo={previous && { word: previous.word, onBack: back }} />
          </Box>
          <DefinitionDetails target={shown} onOpenWord={open} />
        </Surface>
      ) : (
        <Box className={classes.panelEmpty}>
          <EmptyState icon={IconClick} title="Click a word to start" description="Its definition shows here, and you can rate how well you know it." />
        </Box>
      )}
    </Box>
  );
}
