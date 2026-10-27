"use client";

import { Badge, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { categoryLabel } from "@/lib/categories/category-label";
import { CATEGORY_STYLES } from "@/theme/category-styles";
import type { DefinitionTarget } from "./definition-target";
import { dictionaryQuery } from "./dictionary-query";
import classes from "./definition-title.module.css";

/**
 * The word (as Wiktionary spells it, once loaded) and the list it's on. Reached from another word's
 * definition, it has "‹ running" above it: the standard place for Back in a panel (top left, named
 * after where it goes), as in iOS navigation bars.
 */
export function DefinitionTitle({ target, backTo }: { target: DefinitionTarget; backTo?: { word: string; onBack: () => void } | null }) {
  const word = target.word.trim();
  const definition = useQuery({ ...dictionaryQuery(word), enabled: word !== "" });
  const category = target.category;
  return (
    <Stack gap={2}>
      {backTo && (
        <UnstyledButton className={classes.back} onClick={backTo.onBack} aria-label={`Back to ${backTo.word}`}>
          <IconChevronLeft size={18} stroke={2} />
          {backTo.word}
        </UnstyledButton>
      )}
      <Group gap="sm">
        {/* A clicked "word" can be a long unbroken token (a URL or a file path): wrap it, don't overflow. */}
        <Text fw={600} fz="xl" style={{ overflowWrap: "anywhere" }}>
          {definition.data?.word ?? word}
        </Text>
        {category && <Badge styles={{ root: { color: CATEGORY_STYLES[category].text, background: CATEGORY_STYLES[category].tint } }}>{categoryLabel(category)}</Badge>}
      </Group>
    </Stack>
  );
}
