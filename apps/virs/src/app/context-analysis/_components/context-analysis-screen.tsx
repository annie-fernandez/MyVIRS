"use client";

import { Alert, Badge, Group, SegmentedControl, Select, SimpleGrid, Skeleton, Stack, Table, Text, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconAffiliate, IconInfoCircle, IconSearch, IconSortDescendingNumbers, IconX } from "@tabler/icons-react";
import type { ContextOrder, RankingBand } from "@repo/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Pager } from "@/components/ui/pager";
import { Surface } from "@/components/ui/surface";
import { errorMessage } from "@/lib/api-client/error-message";
import { contextListQuery } from "../_lib/context-list-query";
import { contextListsQuery } from "../_lib/context-lists-query";

const PAGE_SIZE = "50";
// Team A's files round relevance and score to 4 decimals; fewer would show the top words as all 1.00.
const DEFAULT_LIST = "ck12-biology";
const BAND_LABELS: Record<RankingBand, string> = { HIGH: "High", MID: "Mid", LOW: "Low", NONE: "Off list" };
const ORDER_DESCRIPTIONS: Record<ContextOrder, string> = {
  context: "Ranked by how central each word is to the book and how common it is, half and half. Rank 1 is the word to teach first.",
  frequency: "Ranked by how common each word is alone, the baseline Team A compares against. Words on the same list are ordered by how often the book uses them.",
};

/**
 * A preview of Team A's ranked word lists: which words in a whole textbook to teach first, by
 * context or by frequency. A viewer for the files they hand us; nothing here is computed by VIRS
 * except the frequency order, which follows their own rule.
 */
export function ContextAnalysisScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL, as on Search words, so a view can be bookmarked or shared.
  const listId = searchParams.get("list") ?? DEFAULT_LIST;
  const by: ContextOrder = searchParams.get("by") === "frequency" ? "frequency" : "context";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const q = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(q);
  const results = useRef<HTMLDivElement>(null);

  function update(changes: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.delete("page");
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }

  const searchFor = useDebouncedCallback((value: string) => {
    if (value !== q) update({ q: value || null });
  }, 300);

  function clearSearch() {
    searchFor.cancel();
    setSearch("");
    update({ q: null });
  }

  const lists = useQuery(contextListsQuery());
  const query = new URLSearchParams({ by, page: String(page), pageSize: PAGE_SIZE });
  if (q) query.set("q", q);
  const ranked = useQuery({ ...contextListQuery(listId, query.toString()), placeholderData: keepPreviousData });
  const list = ranked.data?.list;
  const words = ranked.data?.words;

  return (
    <Stack gap="xl">
      <PageHeader
        eyebrow="Preview"
        title={
          <>
            Analysis by <Marker>context</Marker>
          </>
        }
        description="Team A's ranking of which words in a textbook to teach first. Switch to By frequency to compare it with ranking by how common the words are."
        actions={
          // The same switch as Enhanced text and Statistics: a fixed width split evenly.
          <SegmentedControl
            w={320}
            maw="100%"
            fullWidth
            value={by}
            onChange={(next) => update({ by: next === "frequency" ? "frequency" : null })}
            aria-label="Rank words by"
            data={[
              { value: "context", label: <Group gap={6} wrap="nowrap" justify="center"><IconAffiliate size={16} />By context</Group> },
              { value: "frequency", label: <Group gap={6} wrap="nowrap" justify="center"><IconSortDescendingNumbers size={16} />By frequency</Group> },
            ]}
          />
        }
      />

      <Surface>
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Textbook"
              data={(lists.data ?? []).map((item) => ({ value: item.id, label: item.title }))}
              value={listId}
              onChange={(value) => value && update({ list: value === DEFAULT_LIST ? null : value, q: null })}
              allowDeselect={false}
            />
            <TextInput
              label="Word"
              placeholder="Starts with…"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                searchFor(event.currentTarget.value.trim().toLowerCase());
              }}
              rightSection={search ? <IconX size={14} style={{ cursor: "pointer" }} onClick={clearSearch} aria-label="Clear search" /> : null}
            />
          </SimpleGrid>
          <Text size="sm" c="dimmed">
            {ORDER_DESCRIPTIONS[by]}
          </Text>
        </Stack>
      </Surface>

      {list && (
        <Alert color="virsBlue" icon={<IconInfoCircle size={18} />} title={`About this list: ${list.title}`}>
          <Stack gap={4}>
            <Text size="sm">{list.note}</Text>
            <Text size="sm">
              {list.wordCount.toLocaleString()} word families from {list.summary.tokens.toLocaleString()} words read.{" "}
              {Math.round(list.summary.coverageListed * 100)}% of the book is on a word list, {Math.round(list.summary.coverageHigh * 100)}% on the High list.
            </Text>
          </Stack>
        </Alert>
      )}

      {ranked.isError && (
        <Alert color="red" icon={<IconX size={18} />} title="We couldn't load this list">
          {errorMessage(ranked.error)}
        </Alert>
      )}

      {/* While the next page loads, the current words stay, slightly faded, as on Search words. */}
      <Surface p={0} style={{ opacity: ranked.isPlaceholderData ? 0.6 : 1, transition: "opacity 120ms ease" }}>
        <div ref={results} style={{ scrollMarginTop: 80 }} />
        <div style={{ overflowX: "auto" }}>
          <Table miw={640} layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="10%">Rank</Table.Th>
                <Table.Th w="34%">Word</Table.Th>
                <Table.Th w="16%">Frequency</Table.Th>
                <Table.Th w="14%" ta="right">Relevance</Table.Th>
                <Table.Th w="12%" ta="right">Score</Table.Th>
                <Table.Th w="14%" ta="right">Times used</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ranked.isPending
                ? Array.from({ length: 8 }, (_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td colSpan={6}>
                        <Skeleton height={18} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                : words?.items.map((word) => {
                    const otherForms = word.forms.filter((form) => form !== word.headword);
                    return (
                      <Table.Tr key={word.headword}>
                        <Table.Td>{word.rank.toLocaleString()}</Table.Td>
                        <Table.Td style={{ overflowWrap: "anywhere" }}>
                          <Text fw={500} span>
                            {word.headword}
                          </Text>
                          {otherForms.length > 0 && (
                            <Text size="sm" c="dimmed">
                              {otherForms.join(", ")}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge color="charcoal">{BAND_LABELS[word.band]}</Badge>
                        </Table.Td>
                        <Table.Td ta="right">{word.relevance === null ? "—" : word.relevance.toFixed(4)}</Table.Td>
                        <Table.Td ta="right">{word.priority.toFixed(4)}</Table.Td>
                        <Table.Td ta="right">{word.count === null ? "—" : word.count.toLocaleString()}</Table.Td>
                      </Table.Tr>
                    );
                  })}
              {words?.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="lg">
                      {q ? `No words in this list start with "${q}". Try another spelling, or clear the search.` : "This page is past the end of the list."}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      </Surface>

      {/* The same footer as Search words: what's shown on the left, the pager on the right. */}
      <Group justify="space-between" mt={-16}>
        <Text size="sm" c="dimmed">
          {words ? `${words.total.toLocaleString()} words${q ? ` starting with "${q}"` : ""}` : "Loading words…"}
        </Text>
        {words && (
          <Pager
            page={page}
            total={words.totalPages}
            onChange={(next) => {
              update({ page: String(next) }, false);
              results.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        )}
      </Group>
    </Stack>
  );
}
