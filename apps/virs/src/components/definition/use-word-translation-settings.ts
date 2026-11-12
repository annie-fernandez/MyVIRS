"use client";

import { useTranslateTarget } from "@/lib/translation/use-translate-target";

/**
 * The language the words opened on a page are translated into. Held by the page, not the word's
 * panel, because the panel starts fresh for each word and a language picked for one word should carry
 * over to the next. Every word waits for its own Translate click, so nothing goes to Google until the
 * student asks; until they've said which language they want (`chosen`), Translate asks rather than guessing.
 */
export function useWordTranslationSettings() {
  const { target, setTarget, chosen } = useTranslateTarget();
  return { target, setTarget, chosen };
}

export type WordTranslationSettings = ReturnType<typeof useWordTranslationSettings>;
