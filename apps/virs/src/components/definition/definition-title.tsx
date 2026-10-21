"use client";

import { Badge, Group, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { categoryLabel } from "@/lib/categories/category-label";
import { CATEGORY_STYLES } from "@/theme/category-styles";
import type { DefinitionTarget } from "./definition-target";
import { dictionaryQuery } from "./dictionary-query";

/** The word (as Wiktionary spells it, once loaded) and the list it's on. */
export function DefinitionTitle({ target }: { target: DefinitionTarget }) {
  const word = target.word.trim();
  const definition = useQuery({ ...dictionaryQuery(word), enabled: word !== "" });
  const category = target.category;
  return (
    <Group gap="sm">
      {/* A clicked "word" can be a long unbroken token (a URL or a file path): wrap it, don't overflow. */}
      <Text fw={600} fz="xl" style={{ overflowWrap: "anywhere" }}>
        {definition.data?.word ?? word}
      </Text>
      {category && <Badge styles={{ root: { color: CATEGORY_STYLES[category].text, background: CATEGORY_STYLES[category].tint } }}>{categoryLabel(category)}</Badge>}
    </Group>
  );
}
