"use client";

import { Stack } from "@mantine/core";
import { IconAffiliate } from "@tabler/icons-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";

/**
 * A placeholder while Analysis by context is reworked. The viewer of Team A's ranked lists is in
 * commit 65f6a23 (`git checkout 65f6a23 -- apps/virs/src/app/context-analysis`); its API is still here.
 */
export function ContextAnalysisScreen() {
  return (
    <Stack gap="xl">
      <PageHeader
        eyebrow="Preview"
        title={
          <>
            Analysis by <Marker>context</Marker>
          </>
        }
        description="Which words in a textbook to teach first, ranked by context or by frequency."
      />
      <EmptyState icon={IconAffiliate} title="To be implemented" description="Ranking words by context is coming soon." />
    </Stack>
  );
}
