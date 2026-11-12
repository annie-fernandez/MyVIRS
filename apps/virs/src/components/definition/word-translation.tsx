"use client";

import { Alert, Box, Button, Collapse, Skeleton, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconAlertTriangle, IconChevronDown, IconLanguage } from "@tabler/icons-react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LanguagePicker } from "@/components/translation/language-picker";
import { errorMessage } from "@/lib/api-client/error-message";
import { browserLanguage } from "@/lib/translation/browser-language";
import { languageName } from "@/lib/translation/language-name";
import { translationQuery } from "@/lib/translation/translation-query";
import { translatableWord } from "./translatable-word";
import type { WordTranslationSettings } from "./use-word-translation-settings";
import classes from "./word-translation.module.css";

/** How long the box takes to unfold, and the button to fold away, at the same time. */
const UNFOLD_MS = 200;

/**
 * A translated word, or sentence. Right-to-left languages read correctly because of dir="auto". The
 * placeholder is the text's own height, so nothing moves when the translation arrives; after a language
 * change the old translation stays, faded, until the new one replaces it.
 */
function Translated({ text, target, sentence = false }: { text: string; target: string; sentence?: boolean }) {
  const translation = useQuery({ ...translationQuery(text, target), placeholderData: keepPreviousData });
  if (translation.isPending) {
    return sentence ? (
      <Stack gap={8} py={4} aria-label="Loading the sentence's translation">
        <Skeleton height={14} />
        <Skeleton height={14} width="70%" />
      </Stack>
    ) : (
      <Skeleton height={20} my={4} width="45%" aria-label="Loading the translation" />
    );
  }
  if (translation.isError) {
    return (
      <Alert color="virsOrange" icon={<IconAlertTriangle size={18} />}>
        {errorMessage(translation.error)}
      </Alert>
    );
  }
  return (
    <Text
      className={classes.translation}
      data-stale={translation.isPlaceholderData || undefined}
      dir="auto"
      lang={target}
      fz={sentence ? "md" : "lg"}
      fw={sentence ? undefined : 600}
      aria-live="polite"
      style={{ overflowWrap: "anywhere" }}
    >
      {translation.data.translatedText}
    </Text>
  );
}

/**
 * The clicked word in the student's language. Until they ask, it's one Translate button. The language
 * is their pick, else their preferred language, else their browser's language; only when none of those
 * gives one (an English-only browser) does Translate open the language list first.
 * The button then folds away as a soft box unfolds in its place: the language (click it to change),
 * the translation, and the sentence one button away.
 */
export function WordTranslation({ word, context, settings }: { word: string; context?: string | null; settings: WordTranslationSettings }) {
  const [asked, setAsked] = useState(false);
  const [sentenceShown, setSentenceShown] = useState(false);
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const queryClient = useQueryClient();
  const { target, setTarget, chosen } = settings;
  const text = translatableWord(word);
  if (!text) return null;

  // The sentence's box opens only once its translation is in (the button shows a spinner meanwhile),
  // so it unfolds straight to its final height instead of opening on a placeholder and then jumping.
  // Not fetched before the click, so the sentence isn't sent to Google until the student asks.
  const sentenceQuery = context ? translationQuery(context, target) : null;
  const showSentence = async () => {
    if (!sentenceQuery) return;
    setSentenceLoading(true);
    // A failure shows in the box itself (Translated's alert), so open it either way.
    await queryClient.fetchQuery(sentenceQuery).catch(() => undefined);
    setSentenceLoading(false);
    setSentenceShown(true);
  };

  const language = languageName(target);
  const translateButton = (onClick: () => void) => (
    <Button variant="default" size="xs" leftSection={<IconLanguage size={16} />} onClick={onClick}>
      Translate
    </Button>
  );

  // Before a language is chosen, the browser's own language (unless it's English) is the default.
  const translateWithBrowserLanguage = () => {
    const guess = browserLanguage(navigator.languages ?? [navigator.language]);
    if (!guess) return false;
    setTarget(guess);
    setAsked(true);
    return true;
  };

  return (
    <>
      <Collapse expanded={!asked} transitionDuration={UNFOLD_MS}>
        <Box pb="md">
          {chosen ? (
            translateButton(() => setAsked(true))
          ) : (
            <LanguagePicker
              value={null}
              onChange={(next) => {
                setTarget(next);
                setAsked(true);
              }}
            >
              {/* An English-only browser gives no default, so the list asks. */}
              {(toggle) => translateButton(() => translateWithBrowserLanguage() || toggle())}
            </LanguagePicker>
          )}
        </Box>
      </Collapse>

      <Collapse expanded={asked} transitionDuration={UNFOLD_MS}>
        {/* Only once asked, so nothing is sent to Google before that. */}
        {asked && (
          <Box pb="md">
            <Stack gap={4} className={classes.box}>
              <div>
                <LanguagePicker value={target} onChange={setTarget}>
                  {(toggle) => (
                    <UnstyledButton className={classes.language} onClick={toggle} aria-label={`Translated into ${language}. Change the language`}>
                      <IconLanguage size={14} aria-hidden />
                      {language}
                      <IconChevronDown size={14} aria-hidden />
                    </UnstyledButton>
                  )}
                </LanguagePicker>
              </div>
              <Translated text={text} target={target} />
              {context && (
                <>
                  <Collapse expanded={!sentenceShown} transitionDuration={UNFOLD_MS}>
                    <Box pt={6}>
                      <Button variant="default" size="xs" loading={sentenceLoading} onClick={showSentence}>
                        Translate the sentence
                      </Button>
                    </Box>
                  </Collapse>
                  <Collapse expanded={sentenceShown} transitionDuration={UNFOLD_MS}>
                    {sentenceShown && (
                      <Stack gap={2} pt={8}>
                        <Text size="xs" fw={600} c="dimmed">
                          Sentence
                        </Text>
                        <Translated text={context} target={target} sentence />
                      </Stack>
                    )}
                  </Collapse>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Collapse>
    </>
  );
}
