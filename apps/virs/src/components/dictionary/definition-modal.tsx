"use client";

import { Alert, Anchor, Badge, Group, Modal, ScrollArea, Skeleton, Stack, Text, Typography } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { DictionaryEntry } from "@repo/core";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { CATEGORY_COLORS, categoryLabel, type CategoryKey } from "@/lib/categories-ui";

export interface DefinitionTarget {
  word: string;
  category?: CategoryKey;
}

export function DefinitionModal({ target, onClose }: { target: DefinitionTarget | null; onClose: () => void }) {
  const word = target?.word ?? "";
  const query = useQuery({
    queryKey: ["definition", word.toLowerCase()],
    queryFn: () => apiFetch<DictionaryEntry>(`/api/dictionary/${encodeURIComponent(word)}`),
    enabled: word.length > 0,
    staleTime: Infinity,
    retry: false,
  });

  return (
    <Modal
      opened={target !== null}
      onClose={onClose}
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group gap="sm">
          <Text fw={700} size="lg">
            {query.data?.word ?? word}
          </Text>
          {target?.category && (
            <Badge color={CATEGORY_COLORS[target.category]} variant="light">
              {categoryLabel(target.category)}
            </Badge>
          )}
        </Group>
      }
    >
      {query.isPending ? (
        <Stack gap="xs">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} />
          <Skeleton height={12} />
          <Skeleton height={12} width="80%" />
        </Stack>
      ) : query.isError ? (
        <Alert color="yellow" icon={<IconAlertCircle size={18} />}>
          {query.error.message}
        </Alert>
      ) : (
        <Stack gap="md">
          <Typography>
            {/* Sanitized on the server with an allowlist (see src/lib/dictionary.ts). */}
            <div dangerouslySetInnerHTML={{ __html: query.data.html }} />
          </Typography>
          <Text size="xs" c="dimmed">
            Definition from{" "}
            <Anchor href={`https://en.wiktionary.org/wiki/${encodeURIComponent(query.data.word)}`} target="_blank" rel="noreferrer">
              Wiktionary
            </Anchor>
            , available under CC BY-SA.
          </Text>
        </Stack>
      )}
    </Modal>
  );
}
