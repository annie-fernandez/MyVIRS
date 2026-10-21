"use client";

import { Button, Center, Group, Modal, Stack, Text } from "@mantine/core";
import { sentenceAround, type AnalysisResult } from "@repo/core";
import { Fragment, useMemo, useState } from "react";
import type { DefinitionTarget } from "@/components/definition/definition-target";
import { CategoryLegend } from "@/components/ui/category-legend";
import { Surface } from "@/components/ui/surface";
import { WordTag } from "@/components/ui/word-tag";
import { categoryDescription } from "@/lib/categories/category-description";
import { CATEGORY_KEYS } from "@/lib/categories/category-keys";
import { categoryLabel } from "@/lib/categories/category-label";
import type { CategoryKey } from "@/theme/category-styles";
import { categoryOf } from "./category-of";
import classes from "./enhanced-text.module.css";
import { toParagraphs } from "./to-paragraphs";

/** Words rendered at first; very long documents reveal the rest on request. */
const PAGE_SIZE = 2_000;

/** The passage with every word in its list's color. Click a word for its definition, or a list for its words. */
export function EnhancedText({
  result,
  onWord,
}: {
  result: AnalysisResult;
  onWord: (target: DefinitionTarget) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [listCategory, setListCategory] = useState<CategoryKey | null>(null);
  const paragraphs = useMemo(() => toParagraphs(result.words), [result.words]);
  const counts = result.statistics.wordCount;
  const present = CATEGORY_KEYS.filter((key) => counts[key] > 0);

  const wordsByCategory = useMemo(() => {
    const map = new Map<CategoryKey, string[]>();
    for (const key of CATEGORY_KEYS) map.set(key, []);
    const seen = new Set<string>();
    for (const word of result.words) {
      if (!word.initialValue) continue;
      const key = categoryOf(word);
      const value = (word.value ?? word.initialValue.replace(/[^\p{L}\p{N}'-]/gu, "")).toLowerCase();
      if (!value || seen.has(`${key}:${value}`)) continue;
      seen.add(`${key}:${value}`);
      map.get(key)!.push(value);
    }
    for (const list of map.values()) list.sort((a, b) => a.localeCompare(b));
    return map;
  }, [result.words]);

  return (
    <Stack gap="lg">
      {/* One sheet: the key to the colors at the top, the passage under it. */}
      <Surface p={{ base: "md", sm: "xl" }}>
        <Stack gap="xs" className={classes.key}>
          <CategoryLegend categories={present} counts={counts} onSelect={setListCategory} />
          <Text size="sm" c="dimmed">
            Each color is a word list. Click a list to see its words, or click any word for its definition.
          </Text>
        </Stack>
        <div className={classes.reading}>
          {paragraphs.map((paragraph, paragraphIndex) =>
            paragraph[0]!.index >= visibleCount ? null : (
              <p key={paragraphIndex} className={classes.paragraph}>
                {paragraph.map(({ word, index }) =>
                  index >= visibleCount ? null : (
                    <Fragment key={index}>
                      <WordTag variant="inline" category={categoryOf(word)} onClick={() => onWord({ word: word.value ?? word.initialValue, category: categoryOf(word), context: sentenceAround(result.words, index) })}>
                        {word.initialValue}
                      </WordTag>{" "}
                    </Fragment>
                  ),
                )}
              </p>
            ),
          )}
        </div>
        {visibleCount < result.words.length && (
          <Center mt="lg">
            <Button variant="default" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              Show more of the text
            </Button>
          </Center>
        )}
      </Surface>

      <Modal
        opened={listCategory !== null}
        onClose={() => setListCategory(null)}
        size="lg"
        title={
          listCategory && (
            <Stack gap={2}>
              <Text fw={600} fz="lg">
                {categoryLabel(listCategory)} words in this text
              </Text>
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
              <WordTag key={value} category={listCategory} onClick={() => {
                  setListCategory(null);
                  onWord({ word: value, category: listCategory });
                }}>
                {value}
              </WordTag>
            ))}
          </Group>
        )}
      </Modal>
    </Stack>
  );
}
