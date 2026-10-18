"use client";

import { Alert, Anchor, Button, Group, Menu, Stack, Table, Text, TextInput, UnstyledButton } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconCheck, IconChevronDown, IconSearch, IconVocabulary, IconX } from "@tabler/icons-react";
import { KNOWN_RATING, normalizeWord, type RatingEvent, type RatingValue, type WordProgress } from "@repo/core";
import { useMemo, useState, type ReactNode } from "react";
import { DefinitionModal, type DefinitionTarget } from "@/components/analysis/definition-modal";
import { WordInContext } from "@/components/analysis/word-in-context";
import { EmptyState, Pager, RatingButtons, Surface } from "@/components/ui";
import { RATING_SCALE } from "@/theme";

const PAGE_SIZE = 15;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });

type SortKey = "word" | "rating" | "added";

/** One rating ("1"–"5"), the words you know ("known", rated 4 or 5), or everything. */
export type RatingFilter = "all" | "known" | `${RatingValue}`;

const FILTER_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: "all", label: "All ratings" },
  ...RATING_SCALE.map((step) => ({ value: String(step.value) as RatingFilter, label: `${step.value} – ${step.label}` })),
  { value: "known", label: `${KNOWN_RATING} or 5 – words you know` },
];

function matchesFilter(word: WordProgress, filter: RatingFilter): boolean {
  if (filter === "all") return true;
  if (filter === "known") return word.rating >= KNOWN_RATING;
  return String(word.rating) === filter;
}

const filterLabel = (filter: RatingFilter) =>
  filter === "all" ? "All" : FILTER_OPTIONS.find((option) => option.value === filter)!.label;

interface Sort {
  key: SortKey;
  ascending: boolean;
}

// Each column's natural first order: A to Z, the words you know least first, the newest first.
const FIRST_ORDER: Record<SortKey, boolean> = { word: true, rating: true, added: false };
const COMPARE: Record<SortKey, (a: WordProgress, b: WordProgress) => number> = {
  word: (a, b) => a.word.localeCompare(b.word),
  rating: (a, b) => a.rating - b.rating || b.ratedAt.localeCompare(a.ratedAt),
  added: (a, b) => a.firstRatedAt.localeCompare(b.firstRatedAt),
};

/** Every word the student has rated: search it, filter it by rating, sort it by any column, see it in context and re-rate it. */
export function WordsPanel({
  words,
  rating,
  onRatingChange,
  onRate,
  onRated,
}: {
  words: WordProgress[];
  rating: RatingFilter;
  onRatingChange: (rating: RatingFilter) => void;
  onRate: (word: string, rating: RatingValue, context: string | null) => Promise<void>;
  onRated: (saved: RatingEvent) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "added", ascending: false });
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [definition, setDefinition] = useState<DefinitionTarget | null>(null);

  const sorted = useMemo(() => {
    const needle = normalizeWord(query.trim());
    const direction = sort.ascending ? 1 : -1;
    return words
      .filter((word) => (!needle || word.word.includes(needle)) && matchesFilter(word, rating))
      .sort((a, b) => direction * COMPARE[sort.key](a, b));
  }, [words, query, rating, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function sortBy(key: SortKey) {
    setSort((previous) => (previous.key === key ? { key, ascending: !previous.ascending } : { key, ascending: FIRST_ORDER[key] }));
    setPage(1);
  }

  async function rate(word: WordProgress, rating: RatingValue) {
    setError(null);
    try {
      await onRate(word.word, rating, word.context);
    } catch {
      setError(`We couldn't save your rating for “${word.word}”, so it's back to what it was. Please try again.`);
    }
  }

  if (words.length === 0) {
    return (
      <EmptyState
        icon={IconVocabulary}
        title="No words rated yet"
        description="In an enhanced text, click any word and choose how well you know it, from 1 to 5. Your words collect here."
      />
    );
  }

  const header = (key: SortKey, label: string) => <SortHeader active={sort.key === key} ascending={sort.ascending} onClick={() => sortBy(key)}>{label}</SortHeader>;

  return (
    <Stack gap="md">
      <Group gap="sm">
        <TextInput
          aria-label="Find a word"
          placeholder="Find a word"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setPage(1);
          }}
          w={280}
        />
        {/* A button, not a second text box, so it reads as a filter rather than another field to type in. */}
        <Menu position="bottom-start" width={240}>
          <Menu.Target>
            <Button variant="light" rightSection={<IconChevronDown size={16} />} aria-label="Filter by rating">
              Rating: {filterLabel(rating)}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {FILTER_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                onClick={() => {
                  onRatingChange(option.value);
                  setPage(1);
                }}
                rightSection={rating === option.value ? <IconCheck size={14} /> : null}
                fw={rating === option.value ? 600 : undefined}
              >
                {option.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>

      {error && (
        <Alert color="red" icon={<IconX size={18} />} withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Surface p={0} style={{ overflowX: "auto" }}>
        <Table miw={720} striped={false} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={160} aria-sort={sort.key === "word" ? (sort.ascending ? "ascending" : "descending") : undefined}>
                {header("word", "Word")}
              </Table.Th>
              <Table.Th>In context</Table.Th>
              <Table.Th w={230} aria-sort={sort.key === "rating" ? (sort.ascending ? "ascending" : "descending") : undefined}>
                {header("rating", "How well you know it")}
              </Table.Th>
              <Table.Th w={100} aria-sort={sort.key === "added" ? (sort.ascending ? "ascending" : "descending") : undefined}>
                {header("added", "Added")}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visible.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text size="sm" c="dimmed" py="sm">
                    {query ? `No words match “${query}”.` : "No words with that rating."}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              visible.map((word) => (
                <Table.Tr key={word.word}>
                  <Table.Td>
                    <Anchor component="button" type="button" fw={600} c="var(--virs-text)" onClick={() => setDefinition({ word: word.word, context: word.context })}>
                      {word.word}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <WordInContext word={word.word} context={word.context} lineClamp={2} />
                  </Table.Td>
                  <Table.Td>
                    <RatingButtons value={word.rating} onChange={(rating) => rate(word, rating)} word={word.word} />
                  </Table.Td>
                  <Table.Td style={{ whiteSpace: "nowrap" }}>
                    <Text size="sm">{shortDate(word.firstRatedAt)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Surface>

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {sorted.length.toLocaleString()} {sorted.length === 1 ? "word" : "words"}
        </Text>
        <Pager page={current} total={totalPages} onChange={setPage} />
      </Group>

      <DefinitionModal target={definition} onClose={() => setDefinition(null)} onRated={onRated} />
    </Stack>
  );
}

/** A column title that sorts the table; the arrow shows the current order. */
function SortHeader({ active, ascending, onClick, children }: { active: boolean; ascending: boolean; onClick: () => void; children: ReactNode }) {
  const Arrow = ascending ? IconArrowUp : IconArrowDown;
  return (
    <UnstyledButton onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, fontSize: "inherit" }}>
      {children}
      <Arrow size={14} style={{ visibility: active ? "visible" : "hidden" }} aria-hidden />
    </UnstyledButton>
  );
}
