"use client";

import { Modal, ScrollArea } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { DefinitionDetails } from "./definition-details";
import type { DefinitionTarget } from "./definition-target";
import { DefinitionTitle } from "./definition-title";
import { useWordTrail } from "./use-word-trail";

/** A word's definition and rating in a pop-up, opened by clicking a word in a list. */
export function DefinitionModal({ target, onClose }: { target: DefinitionTarget | null; onClose: () => void }) {
  const { shown, previous, open, back } = useWordTrail(target);
  // Escape steps back one word, like Back; at the first word it closes, as the X always does.
  useWindowEvent("keydown", (event) => {
    if (event.key === "Escape" && previous) back();
  });
  const backTo = previous && { word: previous.word, onBack: back };
  return (
    <Modal opened={target !== null} onClose={onClose} closeOnEscape={!previous} size="lg" scrollAreaComponent={ScrollArea.Autosize} title={shown && <DefinitionTitle target={shown} backTo={backTo} />}>
      {shown && <DefinitionDetails key={shown.word} target={shown} onLeave={onClose} onOpenWord={open} />}
    </Modal>
  );
}
