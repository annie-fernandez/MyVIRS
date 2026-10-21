"use client";

import { Modal, ScrollArea } from "@mantine/core";
import { DefinitionDetails } from "./definition-details";
import type { DefinitionTarget } from "./definition-target";
import { DefinitionTitle } from "./definition-title";

/** A word's definition and rating in a pop-up, opened by clicking a word in a list. */
export function DefinitionModal({ target, onClose }: { target: DefinitionTarget | null; onClose: () => void }) {
  return (
    <Modal opened={target !== null} onClose={onClose} size="lg" scrollAreaComponent={ScrollArea.Autosize} title={target && <DefinitionTitle target={target} />}>
      {target && <DefinitionDetails target={target} onLeave={onClose} />}
    </Modal>
  );
}
