"use client";

import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Container,
  CopyButton,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconCheck, IconCopy, IconLanguage } from "@tabler/icons-react";
import { MAX_TRANSLATE_LENGTH } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api-client";

interface Translation {
  translatedText: string;
  sourceLanguage: string | null;
  target: string;
}

const LANGUAGES: { value: string; label: string }[] = [
  ["af", "Afrikaans"], ["sq", "Albanian"], ["am", "Amharic"], ["ar", "Arabic"], ["hy", "Armenian"],
  ["az", "Azerbaijani"], ["eu", "Basque"], ["bn", "Bengali"], ["bs", "Bosnian"], ["bg", "Bulgarian"],
  ["ca", "Catalan"], ["zh-CN", "Chinese (Simplified)"], ["zh-TW", "Chinese (Traditional)"], ["hr", "Croatian"],
  ["cs", "Czech"], ["da", "Danish"], ["nl", "Dutch"], ["en", "English"], ["et", "Estonian"], ["fi", "Finnish"],
  ["fr", "French"], ["gl", "Galician"], ["ka", "Georgian"], ["de", "German"], ["el", "Greek"], ["gu", "Gujarati"],
  ["ht", "Haitian Creole"], ["haw", "Hawaiian"], ["he", "Hebrew"], ["hi", "Hindi"], ["hmn", "Hmong"],
  ["hu", "Hungarian"], ["is", "Icelandic"], ["id", "Indonesian"], ["ga", "Irish"], ["it", "Italian"],
  ["ja", "Japanese"], ["kk", "Kazakh"], ["ko", "Korean"], ["ku", "Kurdish"], ["ky", "Kyrgyz"], ["lo", "Lao"],
  ["la", "Latin"], ["lv", "Latvian"], ["lt", "Lithuanian"], ["lb", "Luxembourgish"], ["mk", "Macedonian"],
  ["ms", "Malay"], ["mn", "Mongolian"], ["my", "Myanmar (Burmese)"], ["ne", "Nepali"], ["no", "Norwegian"],
  ["ps", "Pashto"], ["fa", "Persian"], ["pl", "Polish"], ["pt", "Portuguese"], ["pa", "Punjabi"],
  ["ro", "Romanian"], ["ru", "Russian"], ["sm", "Samoan"], ["gd", "Scots Gaelic"], ["sr", "Serbian"],
  ["si", "Sinhala"], ["sk", "Slovak"], ["sl", "Slovenian"], ["so", "Somali"], ["es", "Spanish"],
  ["su", "Sundanese"], ["sw", "Swahili"], ["sv", "Swedish"], ["tl", "Tagalog"], ["tg", "Tajik"], ["ta", "Tamil"],
  ["te", "Telugu"], ["th", "Thai"], ["tr", "Turkish"], ["uk", "Ukrainian"], ["ur", "Urdu"], ["uz", "Uzbek"],
  ["vi", "Vietnamese"], ["cy", "Welsh"], ["xh", "Xhosa"], ["yi", "Yiddish"], ["yo", "Yoruba"], ["zu", "Zulu"],
].map(([value, label]) => ({ value: value!, label: label! }));

export function TranslateView() {
  const [text, setText] = useState("");
  const [target, setTarget] = useLocalStorage<string | null>({ key: "virs:translate-target", defaultValue: "es" });

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<Translation>("/api/translate", { method: "POST", json: { text, target } }),
  });

  return (
    <Container size="lg">
      <PageHeader
        title="Translate"
        description="Translate a word, sentence or paragraph into another language."
        icon={<IconLanguage size={24} />}
      />
      <Stack gap="md">
        <Group align="flex-end">
          <Select
            label="Translate to"
            data={LANGUAGES}
            value={target}
            onChange={setTarget}
            searchable
            allowDeselect={false}
            nothingFoundMessage="No language found"
            w={260}
          />
          <Button
            leftSection={<IconLanguage size={18} />}
            disabled={!text.trim() || !target}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Translate
          </Button>
        </Group>

        {mutation.isError && <Alert color="red">{mutation.error.message}</Alert>}

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Textarea
            aria-label="Text to translate"
            placeholder="Enter text to translate"
            autosize
            minRows={10}
            maxLength={MAX_TRANSLATE_LENGTH}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            description={`${text.length.toLocaleString("en-US")} / ${MAX_TRANSLATE_LENGTH.toLocaleString("en-US")} characters`}
            inputWrapperOrder={["input", "description"]}
          />
          <Card withBorder padding="md" mih={236}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                {mutation.data
                  ? `${LANGUAGES.find((language) => language.value === mutation.data.target)?.label ?? mutation.data.target}`
                  : "Translation"}
              </Text>
              {mutation.data && (
                <CopyButton value={mutation.data.translatedText}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
                      <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} onClick={copy} aria-label="Copy translation">
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              )}
            </Group>
            <Text style={{ whiteSpace: "pre-wrap" }} c={mutation.data ? undefined : "dimmed"}>
              {mutation.data?.translatedText ?? "Your translation will appear here."}
            </Text>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
