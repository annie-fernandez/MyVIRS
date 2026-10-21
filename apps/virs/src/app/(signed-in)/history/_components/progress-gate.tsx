"use client";

import { Alert, Skeleton, Stack } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { ProgressData, WordProgress } from "@repo/core";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { errorMessage } from "@/lib/api-client/error-message";
import { progressQuery } from "../_lib/progress-query";

/** Loads the progress data once for both tabs that show it (they share the cached query). */
export function ProgressGate({ children }: { children: (progress: ProgressData & { words: WordProgress[] }) => ReactNode }) {
  const progress = useQuery(progressQuery);
  if (progress.isPending) {
    return (
      <Stack gap="md" aria-label="Loading your progress">
        <Skeleton height={88} />
        <Skeleton height={300} />
      </Stack>
    );
  }
  if (progress.isError) {
    return (
      <Alert color="red" icon={<IconX size={18} />} title="We couldn't load your progress">
        {errorMessage(progress.error)}
      </Alert>
    );
  }
  return <>{children(progress.data)}</>;
}
