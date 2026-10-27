"use client";

import { Alert, Anchor, Skeleton, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { errorMessage } from "@/lib/api-client/error-message";
import type { DefinitionTarget } from "./definition-target";
import { DefinitionHtml } from "./definition-html";
import { dictionaryQuery } from "./dictionary-query";
import { FormOfNote } from "./form-of-note";
import { WordPronunciation } from "./word-pronunciation";
import { WordRating } from "./word-rating";

interface DefinitionDetailsProps {
  target: DefinitionTarget;
  onLeave?: () => void;
  /** Opens another word in the same place, e.g. "run" from "running" (see useWordTrail); Back is in DefinitionTitle. */
  onOpenWord?: (word: string) => void;
}

/** How the word is said (once the dictionary knows it), how well the student knows it (they can rate it here), then its definition. */
export function DefinitionDetails({ target, onLeave, onOpenWord }: DefinitionDetailsProps) {
  const word = target.word.trim();
  const definition = useQuery({ ...dictionaryQuery(word), enabled: word !== "" });

  return (
    <>
      {/* Right under the word in the title (not in it: the pop-up and drawer titles are headings). Only for
          words the dictionary knows, so a typo, name or number is never read out as if it were a word. */}
      {definition.data && <WordPronunciation key={`pronunciation:${definition.data.word}`} word={definition.data.word} respelling={definition.data.respelling} audioUrl={definition.data.audioUrl} />}
      {/* Rating next: definitions can run long, and the rating is the thing to do here. */}
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
          {/* "Falling" says only "present participle of fall": just the sentence, linking to fall. A word
              with meanings of its own ("handling") keeps them, after the same sentence. */}
          {definition.data.formOf && <FormOfNote word={definition.data.word} formOf={definition.data.formOf} onOpenWord={onOpenWord} />}
          {!definition.data.formOf?.only && <DefinitionHtml html={definition.data.html} />}
          <Text size="xs" c="dimmed">
            Definition from{" "}
            <Anchor href={`https://en.wiktionary.org/wiki/${encodeURIComponent(definition.data.word)}`} target="_blank" rel="noreferrer" inherit underline="always">
              Wiktionary
            </Anchor>
            , available under CC BY-SA.
            {/* Recordings carry their own licenses; the file's page names the speaker and the license. */}
            {definition.data.audioUrl && (
              <>
                {" "}
                <Anchor href={`https://commons.wikimedia.org/wiki/File:En-us-${encodeURIComponent(definition.data.word)}.ogg`} target="_blank" rel="noreferrer" inherit underline="always">
                  Recording
                </Anchor>{" "}
                from Wikimedia Commons.
              </>
            )}
          </Text>
        </Stack>
      )}
    </>
  );
}
