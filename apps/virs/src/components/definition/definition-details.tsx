"use client";

import { Alert, Anchor, Skeleton, Stack, Text, Typography } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { errorMessage } from "@/lib/api-client/error-message";
import type { DefinitionTarget } from "./definition-target";
import { dictionaryQuery } from "./dictionary-query";
import { WordRating } from "./word-rating";

/** How well the student knows the word (they can rate it here), then its Wiktionary definition. */
export function DefinitionDetails({ target, onLeave }: { target: DefinitionTarget; onLeave?: () => void }) {
  const word = target.word.trim();
  const definition = useQuery({ ...dictionaryQuery(word), enabled: word !== "" });

  return (
    <>
      {/* Rating first: definitions can run long, and the rating is the thing to do here. */}
      {word && <WordRating key={word} word={word} analysisId={target.analysisId ?? null} context={target.context ?? null} onLeave={onLeave} />}
      {definition.isPending ? (
        <Stack gap="xs" aria-label="Loading the definition">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} />
          <Skeleton height={12} />
          <Skeleton height={12} width="80%" />
        </Stack>
      ) : definition.isError ? (
        <Alert color="virsOrange" icon={<IconAlertTriangle size={18} />}>
          {errorMessage(definition.error)}
        </Alert>
      ) : (
        <Stack gap="md">
          <Typography>
            {/* Sanitized on the server with an allowlist (see src/app/api/_lib/dictionary/extract-english-definitions.ts). */}
            <div dangerouslySetInnerHTML={{ __html: definition.data.html }} />
          </Typography>
          <Text size="xs" c="dimmed">
            Definition from{" "}
            <Anchor href={`https://en.wiktionary.org/wiki/${encodeURIComponent(definition.data.word)}`} target="_blank" rel="noreferrer" inherit underline="always">
              Wiktionary
            </Anchor>
            , available under CC BY-SA.
          </Text>
        </Stack>
      )}
    </>
  );
}
