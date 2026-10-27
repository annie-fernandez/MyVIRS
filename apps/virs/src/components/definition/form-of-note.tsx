"use client";

import { Anchor, Text } from "@mantine/core";
import type { FormOf } from "@repo/core";

// Wiktionary's grammar terms in the words a K-12 reader knows.
const RELATION: Record<FormOf["relation"], string> = {
  plural: "the plural of",
  past: "the past tense of",
  ing: "the -ing form of",
  comparative: "the “more” form of",
  superlative: "the “most” form of",
  form: "a form of",
};

/**
 * "Falling is the -ing form of fall." The base word is always the same underlined link in the sentence,
 * whether or not the word has meanings of its own; it opens in the same panel, with "‹ falling" to come
 * back, never inside this one (a whole second entry under the sentence was hard to scroll past).
 */
export function FormOfNote({ word, formOf, onOpenWord }: { word: string; formOf: FormOf; onOpenWord?: (word: string) => void }) {
  return (
    <Text>
      <b>{word.charAt(0).toUpperCase() + word.slice(1)}</b> is {formOf.only ? "" : "also "}
      {RELATION[formOf.relation]}{" "}
      {onOpenWord ? (
        <Anchor component="button" inherit fw={700} underline="always" onClick={() => onOpenWord(formOf.base)}>
          {formOf.base}
        </Anchor>
      ) : (
        <b>{formOf.base}</b>
      )}
      .
    </Text>
  );
}
