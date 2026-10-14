"use client";

import { Alert, Anchor, Badge, Group, Modal, ScrollArea, Skeleton, Stack, Text, Typography } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { DictionaryEntry } from "@repo/core";
import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { categoryLabel } from "@/lib/categories";
import { CATEGORY_STYLES, type CategoryKey } from "@/theme";

export interface DefinitionTarget {
  word: string;
  category?: CategoryKey;
}

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; entry: DictionaryEntry };

// Definitions don't change during a visit, so each word is fetched once.
const cache = new Map<string, DictionaryEntry>();

/** A word's Wiktionary definition, opened by clicking a word anywhere in the app. */
export function DefinitionModal({ target, onClose }: { target: DefinitionTarget | null; onClose: () => void }) {
  const word = target?.word.trim() ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!word) return;
    const key = word.toLowerCase();
    const cached = cache.get(key);
    if (cached) {
      setState({ status: "ready", entry: cached });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<DictionaryEntry>(`/api/dictionary/${encodeURIComponent(word)}`)
      .then((entry) => {
        cache.set(key, entry);
        if (!cancelled) setState({ status: "ready", entry });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [word]);

  const category = target?.category;

  return (
    <Modal
      opened={target !== null}
      onClose={onClose}
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group gap="sm">
          <Text fw={600} fz="xl">
            {state.status === "ready" ? state.entry.word : word}
          </Text>
          {category && (
            <Badge styles={{ root: { color: CATEGORY_STYLES[category].text, background: CATEGORY_STYLES[category].tint } }}>
              {categoryLabel(category)}
            </Badge>
          )}
        </Group>
      }
    >
      {state.status === "loading" ? (
        <Stack gap="xs" aria-label="Loading the definition">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} />
          <Skeleton height={12} />
          <Skeleton height={12} width="80%" />
        </Stack>
      ) : state.status === "error" ? (
        <Alert color="virsOrange" icon={<IconAlertTriangle size={18} />}>
          {state.message}
        </Alert>
      ) : (
        <Stack gap="md">
          <Typography>
            {/* Sanitized on the server with an allowlist (see src/lib/dictionary.ts). */}
            <div dangerouslySetInnerHTML={{ __html: state.entry.html }} />
          </Typography>
          <Text size="xs" c="dimmed">
            Definition from{" "}
            <Anchor href={`https://en.wiktionary.org/wiki/${encodeURIComponent(state.entry.word)}`} target="_blank" rel="noreferrer" inherit>
              Wiktionary
            </Anchor>
            , available under CC BY-SA.
          </Text>
        </Stack>
      )}
    </Modal>
  );
}
