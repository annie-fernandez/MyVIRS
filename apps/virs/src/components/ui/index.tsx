"use client";

// The shared building blocks every Mantine screen is assembled from. Rules for when to use each are
// in apps/virs/DESIGN.md; /style-guide renders them all. Add a component here only when a second
// screen needs it.

import {
  Box,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
  type PaperProps,
} from "@mantine/core";
import { IconArrowRight, type Icon } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import { ShellLink } from "@/components/layout/shell-link";
import { categoryDescription, categoryLabel } from "@/lib/categories";
import {
  CATEGORY_STYLES,
  RATING_SCALE,
  textOn,
  tintVars,
  type CategoryKey,
  type RatingValue,
  type VirsColor,
} from "@/theme";
import classes from "./ui.module.css";

/**
 * Highlighter stroke behind one key word of a page title. One per title, at most. Yellow unless the
 * screen has its own color (the Word document screen is cyan, the PDF screen green), which is how
 * each screen shows its color.
 */
export function Marker({ children, color }: { children: ReactNode; color?: VirsColor }) {
  return (
    <span className={classes.marker} style={color ? ({ "--marker-color": `var(--mantine-color-${color}-3)` } as CSSProperties) : undefined}>
      {children}
    </span>
  );
}

interface PageHeaderProps {
  /** Short orange line above the title, e.g. the site tagline on Home. Optional. */
  eyebrow?: ReactNode;
  /** The page title. Wrap one key word in <Marker>. */
  title: ReactNode;
  /** One or two sentences saying what the page does. */
  description?: ReactNode;
  /** The page's main action(s), shown under the description. */
  actions?: ReactNode;
}

/** The top of every screen: optional eyebrow, the title, a short description and the main action. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Box>
      {eyebrow && (
        <Text className={classes.eyebrow} fw={600} size="sm" mb={6}>
          {eyebrow}
        </Text>
      )}
      <Title order={1} mb={description ? 8 : 0}>
        {title}
      </Title>
      {description && (
        <Text c="dimmed" fz="lg" maw={640} className={classes.lead}>
          {description}
        </Text>
      )}
      {actions && (
        <Group gap="sm" mt="lg">
          {actions}
        </Group>
      )}
    </Box>
  );
}

/** A titled group of content within a screen. */
export function Section({ title, description, children }: { title: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <Stack gap="sm" component="section">
      <Box>
        <Title order={2} fz="lg">
          {title}
        </Title>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Stack>
  );
}

interface OptionCardProps {
  href: string;
  color: VirsColor;
  icon: Icon;
  title: ReactNode;
  description?: ReactNode;
  /** Smaller padding and icon, for three or more side by side. */
  compact?: boolean;
}

/** A link to a choice (a way to add text, a tool), with its color on the icon. Use in grids of options. */
export function OptionCard({ href, color, icon: IconComponent, title, description, compact = false }: OptionCardProps) {
  return (
    <UnstyledButton
      component={ShellLink}
      href={href}
      className={classes.optionCard}
      data-compact={compact || undefined}
      style={tintVars(color) as CSSProperties}
    >
      <Group wrap="nowrap" gap={compact ? "sm" : "md"}>
        <ThemeIcon size={compact ? 36 : 48} className={classes.optionIcon}>
          <IconComponent size={compact ? 20 : 24} stroke={1.8} />
        </ThemeIcon>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} fz={compact ? "md" : "lg"}>
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Box>
        <IconArrowRight size={18} className={classes.optionArrow} />
      </Group>
    </UnstyledButton>
  );
}

/** A white card on the gray page: the screen's main panel (its input or result) and any other card. */
export function Surface({ children, ...props }: { children: ReactNode } & PaperProps) {
  return (
    <Paper p="lg" {...props} className={classes.surface}>
      {children}
    </Paper>
  );
}

interface WordTagProps {
  category: CategoryKey;
  children: ReactNode;
  /** Makes the word a button, e.g. to open its definition. */
  onClick?: () => void;
  /** Shows the word without its category color, e.g. when that category's highlight is turned off. */
  plain?: boolean;
  /** "inline" colors only the text, for words inside a passage; "chip" adds the tint, for words on their own. */
  variant?: "inline" | "chip";
}

/** A word marked in its vocabulary category's color. The tooltip names the category. */
export function WordTag({ category, children, onClick, plain = false, variant = "chip" }: WordTagProps) {
  const style = CATEGORY_STYLES[category];
  const tint = { "--word-tint": style.tint } as CSSProperties;
  const colors = plain ? tint : variant === "chip" ? { ...tint, color: style.text, background: style.tint } : { ...tint, color: style.text };
  if (onClick) {
    return (
      <button type="button" className={classes.wordTag} data-plain={plain || undefined} data-variant={variant} data-clickable style={colors} title={categoryLabel(category)} onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <Tooltip label={categoryLabel(category)}>
      <span className={classes.wordTag} data-plain={plain || undefined} data-variant={variant} style={colors}>
        {children}
      </span>
    </Tooltip>
  );
}

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

interface RatingButtonsProps {
  value: RatingValue | null;
  onChange: (value: RatingValue) => void;
  /** The word being rated, for screen readers. */
  word: string;
  disabled?: boolean;
}

/** The five-step "how well do you know this word" control. Numbers on the buttons, labels on hover. */
export function RatingButtons({ value, onChange, word, disabled }: RatingButtonsProps) {
  return (
    <div className={classes.rating} role="radiogroup" aria-label={`How well do you know "${word}"?`}>
      {RATING_SCALE.map((step) => (
        <Tooltip key={step.value} label={step.label}>
          <UnstyledButton
            className={classes.ratingStep}
            role="radio"
            aria-checked={value === step.value}
            aria-label={step.label}
            data-selected={value === step.value || undefined}
            disabled={disabled}
            onClick={() => onChange(step.value)}
            style={{ ...tintVars(step.color), "--tint-on": textOn(step.color) } as CSSProperties}
          >
            {step.value}
          </UnstyledButton>
        </Tooltip>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: Icon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

/** What a list or panel shows before there is anything in it. Always says what to do next. */
export function EmptyState({ icon: IconComponent, title, description, action }: EmptyStateProps) {
  return (
    <Box className={classes.emptyState}>
      <ThemeIcon size={44} variant="light" color="virsOrange" mx="auto" mb="sm">
        <IconComponent size={22} stroke={1.8} />
      </ThemeIcon>
      <Text fw={600}>{title}</Text>
      {description && (
        <Text size="sm" c="dimmed" maw={420} mx="auto" mt={4}>
          {description}
        </Text>
      )}
      {action && <Box mt="md">{action}</Box>}
    </Box>
  );
}
