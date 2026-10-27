"use client";

import { Drawer } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { DefinitionDetails } from "@/components/definition/definition-details";
import type { DefinitionTarget } from "@/components/definition/definition-target";
import { DefinitionTitle } from "@/components/definition/definition-title";
import { useWordTrail } from "@/components/definition/use-word-trail";

/** The clicked word's rating and definition, sliding in from the right where there's no room beside the passage. */
export function DefinitionDrawer({ target, onClose }: { target: DefinitionTarget | null; onClose: () => void }) {
  const { shown, previous, open, back } = useWordTrail(target);
  // Escape steps back one word, like Back; at the first word it closes, as the X always does.
  useWindowEvent("keydown", (event) => {
    if (event.key === "Escape" && previous) back();
  });
  const backTo = previous && { word: previous.word, onBack: back };
  return (
    <Drawer opened={target !== null} onClose={onClose} closeOnEscape={!previous} position="right" size="min(480px, 100vw)" title={shown && <DefinitionTitle target={shown} backTo={backTo} />}>
      {shown && <DefinitionDetails key={shown.word} target={shown} onLeave={onClose} onOpenWord={open} />}
    </Drawer>
  );
}
