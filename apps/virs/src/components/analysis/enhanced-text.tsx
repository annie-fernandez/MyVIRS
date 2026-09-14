"use client";

import {
  Badge,
  Button,
  Center,
  Chip,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import type { AnalysisResult, WordMatch } from "@repo/core";
import { Fragment, useEffect, useMemo, useState } from "react";
import { DefinitionModal, type DefinitionTarget } from "@/components/dictionary/definition-modal";
import {
  CATEGORY_COLORS,
  CATEGORY_KEYS,
  categoryDescription,
  categoryLabel,
  categoryTextColor,
  type CategoryKey,
} from "@/lib/categories-ui";
import classes from "./enhanced-text.module.css";

const PAGE_SIZE = 2_000;

function categoryOf(word: WordMatch): CategoryKey {
  return word.category ?? "offList";
}

/** Splits the flat token list on paragraph markers, keeping each token's global index. */
function toParagraphs(words: WordMatch[]): { word: WordMatch; index: number }[][] {
  const paragraphs: { word: WordMatch; index: number }[][] = [[]];
  words.forEach((word, index) => {
    if (word.initialValue === "") paragraphs.push([]);
    else paragraphs[paragraphs.length - 1]!.push({ word, index });
  });
  return paragraphs.filter((paragraph) => paragraph.length > 0);
}

export function EnhancedText({ result }: { result: AnalysisResult }) {
  const [highlighted, setHighlighted] = useState<string[]>(CATEGORY_KEYS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [definition, setDefinition] = useState<DefinitionTarget | null>(null);
  const [listCategory, setListCategory] = useState<CategoryKey | null>(null);
  const { ref: sentinelRef, entry } = useIntersection({ rootMargin: "600px" });

  const paragraphs = useMemo(() => toParagraphs(result.words), [result.words]);
  const totalTokens = result.words.length;
  const hasMore = visibleCount < totalTokens;

  useEffect(() => {
    if (entry?.isIntersecting && hasMore) setVisibleCount((count) => count + PAGE_SIZE);
  }, [entry?.isIntersecting, hasMore]);

  const wordsByCategory = useMemo(() => {
    const map = new Map<CategoryKey, string[]>();
    for (const key of CATEGORY_KEYS) {
      const values = new Set<string>();
      for (const word of result.words) {
        if (word.initialValue && categoryOf(word) === key) {
          values.add(word.value ?? word.initialValue.replace(/[^\p{L}\p{N}'-]/gu, ""));
        }
      }
      map.set(key, [...values].filter(Boolean).sort((a, b) => a.localeCompare(b)));
    }
    return map;
  }, [result.words]);

  const counts = result.statistics.wordCount;
  const presentCategories = CATEGORY_KEYS.filter((key) => counts[key] > 0);

  return (
    <Stack gap="lg">
      <Paper withBorder p="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>Highlight word lists</Text>
            <Group gap="xs">
              <Button size="compact-xs" variant="subtle" onClick={() => setHighlighted(CATEGORY_KEYS)}>
                All
              </Button>
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setHighlighted([])}>
                None
              </Button>
            </Group>
          </Group>
          <Chip.Group multiple value={highlighted} onChange={setHighlighted}>
            <Group gap="xs">
              {presentCategories.map((key) => (
                <Tooltip key={key} label={categoryDescription(key)} multiline w={260} withArrow openDelay={300}>
                  <Chip value={key} color={CATEGORY_COLORS[key]} variant="light" size="sm">
                    {categoryLabel(key)} · {counts[key]}
                  </Chip>
                </Tooltip>
              ))}
            </Group>
          </Chip.Group>
          <Group gap={6}>
            <Text size="xs" c="dimmed">
              Word lists in this text:
            </Text>
            {presentCategories.map((key) => (
              <Badge
                key={key}
                component="button"
                color={CATEGORY_COLORS[key]}
                variant="outline"
                size="sm"
                style={{ cursor: "pointer" }}
                onClick={() => setListCategory(key)}
              >
                {categoryLabel(key)}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p={{ base: "md", sm: "xl" }}>
        <div className={classes.text}>
          {paragraphs.map((paragraph, paragraphIndex) => {
            if (paragraph[0]!.index >= visibleCount) return null;
            return (
              <p key={paragraphIndex} className={classes.paragraph}>
                {paragraph.map(({ word, index }) => {
                  if (index >= visibleCount) return null;
                  const key = categoryOf(word);
                  const isHighlighted = highlighted.includes(key);
                  return (
                    <Fragment key={index}>
                      <button
                        type="button"
                        className={classes.word}
                        style={{ "--word-color": categoryTextColor(key) } as React.CSSProperties}
                        data-dimmed={isHighlighted ? undefined : true}
                        title={categoryLabel(key)}
                        onClick={() => setDefinition({ word: word.initialValue, category: key })}
                      >
                        {word.initialValue}
                      </button>{" "}
                    </Fragment>
                  );
                })}
              </p>
            );
          })}
        </div>
        {hasMore && (
          <Center ref={sentinelRef} py="md">
            <Loader size="sm" />
          </Center>
        )}
      </Paper>

      <Modal
        opened={listCategory !== null}
        onClose={() => setListCategory(null)}
        size="lg"
        title={
          listCategory && (
            <Stack gap={2}>
              <Text fw={700}>{categoryLabel(listCategory)} words in this text</Text>
              <Text size="sm" c="dimmed">
                {categoryDescription(listCategory)}
              </Text>
            </Stack>
          )
        }
      >
        {listCategory && (
          <Group gap={6}>
            {wordsByCategory.get(listCategory)!.map((value) => (
              <Badge
                key={value}
                component="button"
                variant="light"
                color={CATEGORY_COLORS[listCategory]}
                tt="none"
                size="lg"
                style={{ cursor: "pointer" }}
                onClick={() => setDefinition({ word: value, category: listCategory })}
              >
                {value}
              </Badge>
            ))}
          </Group>
        )}
      </Modal>

      <DefinitionModal target={definition} onClose={() => setDefinition(null)} />
    </Stack>
  );
}
