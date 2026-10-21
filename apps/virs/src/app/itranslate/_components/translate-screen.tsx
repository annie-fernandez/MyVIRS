"use client";

import { Alert, Button, CopyButton, Group, Select, SimpleGrid, Stack, Text, Textarea } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconCheck, IconCopy, IconLanguage, IconX } from "@tabler/icons-react";
import { MAX_TRANSLATE_LENGTH } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { errorMessage } from "@/lib/api-client/error-message";
import { translateInBrowser } from "../_lib/translate-in-browser";
import { TRANSLATION_LANGUAGES } from "../_lib/translation-languages";
import { languageName } from "./language-name";

/** Height of the text and translation boxes, in lines. */
const BOX_ROWS = 10;

export function TranslateScreen() {
  const [text, setText] = useState("");
  // Remembered per browser, so a student doesn't pick their language every visit.
  const [target, setTarget] = useLocalStorage<string>({ key: "virs:translate-target", defaultValue: "es" });
  const translate = useMutation({ mutationFn: ({ text, target }: { text: string; target: string }) => translateInBrowser(text, target) });
  const result = translate.data;

  const nearLimit = text.length > MAX_TRANSLATE_LENGTH * 0.9;

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            <Marker color="virsBlue">Translate</Marker> a passage
          </>
        }
        description="Translate a word, a sentence or a whole paragraph into another language."
      />

      <Surface p={{ base: "md", sm: "lg" }}>
        <Stack gap="sm">
          <Group align="flex-end" gap="sm">
            <Select
              label="Translate to"
              data={TRANSLATION_LANGUAGES}
              value={target}
              onChange={(value) => value && setTarget(value)}
              searchable
              nothingFoundMessage="No language with that name"
              w={260}
            />
          </Group>
          {/* Two identical boxes: fixed height, so they stay the same size whatever is in them. */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
            <Textarea
              label="Your text"
              placeholder="Type or paste the text to translate"
              rows={BOX_ROWS}
              maxLength={MAX_TRANSLATE_LENGTH}
              value={text}
              onChange={(event) => setText(event.currentTarget.value)}
            />
            <Textarea
              label={result ? languageName(result.target) : "Translation"}
              placeholder="Your translation will appear here."
              rows={BOX_ROWS}
              readOnly
              aria-live="polite"
              value={result?.translatedText ?? ""}
            />
          </SimpleGrid>
          <Group justify="space-between" gap="xs">
            <Text size="sm" c={nearLimit ? "virsOrange.8" : "dimmed"}>
              {text.length.toLocaleString()} of {MAX_TRANSLATE_LENGTH.toLocaleString()} characters
            </Text>
            <Group gap="sm">
              {/* Copy sits here, not inside the translation box, so both boxes wrap text at the same width. */}
              <CopyButton value={result?.translatedText ?? ""}>
                {({ copied, copy }) => (
                  <Button variant="default" leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />} disabled={!result} onClick={copy}>
                    {copied ? "Copied" : "Copy translation"}
                  </Button>
                )}
              </CopyButton>
              <Button leftSection={<IconLanguage size={16} />} disabled={!text.trim()} loading={translate.isPending} onClick={() => translate.mutate({ text, target })}>
                Translate
              </Button>
            </Group>
          </Group>
          {translate.isError && (
            <Alert color="red" icon={<IconX size={18} />} title="We couldn't translate this">
              {errorMessage(translate.error)}
            </Alert>
          )}
        </Stack>
      </Surface>
    </Stack>
  );
}
