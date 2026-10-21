"use client";

import { Group, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { categoryDescription } from "@/lib/categories/category-description";
import { categoryLabel } from "@/lib/categories/category-label";
import { CATEGORY_STYLES, type CategoryKey } from "@/theme/category-styles";
import classes from "./category-legend.module.css";

interface CategoryLegendProps {
  categories: CategoryKey[];
  /** Word counts to show beside each label. */
  counts?: Partial<Record<CategoryKey, number>>;
  /** Makes each entry a button, e.g. to list that category's words. */
  onSelect?: (category: CategoryKey) => void;
}

/** A key to the category colors. Show it wherever WordTags appear. */
export function CategoryLegend({ categories, counts, onSelect }: CategoryLegendProps) {
  return (
    <Group gap="lg" component="ul" style={{ listStyle: "none", padding: 0, margin: 0, rowGap: 4 }}>
      {categories.map((category) => {
        const content = (
          <>
            <span className={classes.legendSwatch} style={{ background: CATEGORY_STYLES[category].text }} />
            <Text size="sm" span>
              {categoryLabel(category)}
              {counts?.[category] !== undefined && (
                <Text span size="sm" c="dimmed">
                  {" "}
                  {counts[category]!.toLocaleString()}
                </Text>
              )}
            </Text>
          </>
        );
        return (
          <li key={category}>
            <Tooltip label={categoryDescription(category)} multiline w={260}>
              {onSelect ? (
                <UnstyledButton className={classes.legendItem} data-clickable onClick={() => onSelect(category)}>
                  {content}
                </UnstyledButton>
              ) : (
                <span className={classes.legendItem}>{content}</span>
              )}
            </Tooltip>
          </li>
        );
      })}
    </Group>
  );
}
