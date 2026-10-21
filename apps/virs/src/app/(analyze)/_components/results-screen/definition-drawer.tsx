"use client";

import { Drawer } from "@mantine/core";
import { DefinitionDetails } from "@/components/definition/definition-details";
import type { DefinitionTarget } from "@/components/definition/definition-target";
import { DefinitionTitle } from "@/components/definition/definition-title";

/** The clicked word's rating and definition, sliding in from the right where there's no room beside the passage. */
export function DefinitionDrawer({ target, onClose }: { target: DefinitionTarget | null; onClose: () => void }) {
  return (
    <Drawer opened={target !== null} onClose={onClose} position="right" size="min(480px, 100vw)" title={target && <DefinitionTitle target={target} />}>
      {target && <DefinitionDetails target={target} onLeave={onClose} />}
    </Drawer>
  );
}
