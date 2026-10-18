"use client";

import {
  Alert,
  Anchor,
  Group,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp, IconInfoCircle, IconSearch, IconX } from "@tabler/icons-react";
import { CATEGORY_INFO, gradeLabel, parseGrade, parseWordCategory, type Paginated, type Word, type WordCategory } from "@repo/core";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DefinitionModal, type DefinitionTarget } from "@/components/analysis/definition-modal";
import { Marker, PageHeader, Pager, Surface, WordTag } from "@/components/ui";
import { apiFetch, ApiClientError, errorMessage } from "@/lib/api-client";
import { CATEGORY_SELECT_DATA, GRADE_SELECT_DATA } from "@/lib/categories";

const PAGE_SIZES = ["20", "60", "200"];

type Load<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

/** Fetches JSON for a URL, keeping the previous data on screen while the next request runs. */
function useJson<T>(url: string | null): { state: Load<T>; refreshing: boolean } {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setRefreshing(true);
    apiFetch<T>(url)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch((error: unknown) => !cancelled && setState({ status: "error", message: errorMessage(error) }))
      .finally(() => !cancelled && setRefreshing(false));
    return () => {
      cancelled = true;
    };
  }, [url]);
  return { state, refreshing };
}

export function SearchScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL so a search can be bookmarked or shared.
  const category: WordCategory = parseWordCategory(searchParams.get("category") ?? "") ?? "k1";
  const grade = parseGrade(searchParams.get("grade") ?? "") ?? null;
  const sort = searchParams.get("sort") === "desc" ? "desc" : "asc";
  const pageSize = PAGE_SIZES.includes(searchParams.get("pageSize") ?? "") ? searchParams.get("pageSize")! : "20";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [debounced] = useDebouncedValue(search.trim(), 300);
  const [definition, setDefinition] = useState<DefinitionTarget | null>(null);
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

  useEffect(() => {
    if (debounced !== (searchParams.get("q") ?? "")) update({ q: debounced || null });
    // Only react to the debounced input; `update` reads the latest params itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = new URLSearchParams({ category, sort, pageSize, page: String(page) });
  if (grade) query.set("grade", grade);
  if (debounced) query.set("q", debounced);
  const { state: words, refreshing } = useJson<Paginated<Word>>(`/api/words?${query.toString()}`);

  // Every list the typed word appears in, whatever list is selected.
  const [lookup, setLookup] = useState<Word[]>([]);
  useEffect(() => {
    if (!debounced) {
      setLookup([]);
      return;
    }
    let cancelled = false;
    apiFetch<Word[]>(`/api/words/${encodeURIComponent(debounced)}`)
      .then((entries) => !cancelled && setLookup(entries))
      .catch((error: unknown) => !cancelled && setLookup(error instanceof ApiClientError && error.status === 404 ? [] : []));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const label = CATEGORY_INFO[category].label;

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Search the word <Marker>lists</Marker>
          </>
        }
        description="Browse the K-12 school dictionary by list and grade. Each K list holds 1,000 words, ordered by how often they appear."
      />

      <Surface>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <TextInput
            label="Word"
            placeholder="Starts with…"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            rightSection={search ? <IconX size={14} style={{ cursor: "pointer" }} onClick={() => setSearch("")} aria-label="Clear search" /> : null}
          />
          <Select label="Word list" data={CATEGORY_SELECT_DATA} value={category} onChange={(value) => value && update({ category: value })} />
          <Select label="Grade" placeholder="All grades" data={GRADE_SELECT_DATA} value={grade} onChange={(value) => update({ grade: value })} clearable allowDeselect />
          <Select label="Words per page" data={PAGE_SIZES} value={pageSize} onChange={(value) => value && update({ pageSize: value })} />
        </SimpleGrid>
      </Surface>

      {debounced && lookup.length > 0 && (
        <Alert color="virsBlue" icon={<IconInfoCircle size={18} />}>
          <Group gap="xs">
            <Text size="sm">
              <Anchor component="button" inherit onClick={() => setDefinition({ word: lookup[0]!.value })}>
                {lookup[0]!.value}
              </Anchor>{" "}
              is in:
            </Text>
            {lookup.map((entry) => (
              <WordTag key={entry.id} category={entry.category}>
                {CATEGORY_INFO[entry.category].label}
                {entry.grade ? ` · ${gradeLabel(entry.grade)}` : ""}
              </WordTag>
            ))}
          </Group>
        </Alert>
      )}

      {words.status === "error" && (
        <Alert color="red" icon={<IconX size={18} />} title="We couldn't load the words">
          {words.message}
        </Alert>
      )}

      {/* While the next page loads, the current words stay, slightly faded (no white cover over them). */}
      <Surface p={0} style={{ opacity: refreshing && words.status === "ready" ? 0.6 : 1, transition: "opacity 120ms ease" }}>
        <div ref={results} style={{ scrollMarginTop: 80 }} />
        <div style={{ overflowX: "auto" }}>
          {/* Fixed column widths, so List and Grade stay put when sorting or filtering changes the words shown. */}
          <Table miw={420} layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="50%" aria-sort={sort === "asc" ? "ascending" : "descending"}>
                  {/* Sorts like the column headers on History's Your words: click to flip the order. */}
                  <UnstyledButton
                    onClick={() => update({ sort: sort === "asc" ? "desc" : "asc" })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, fontSize: "inherit" }}
                    aria-label={sort === "asc" ? "Word, A to Z. Sort Z to A" : "Word, Z to A. Sort A to Z"}
                  >
                    Word
                    {sort === "asc" ? <IconArrowUp size={14} aria-hidden /> : <IconArrowDown size={14} aria-hidden />}
                  </UnstyledButton>
                </Table.Th>
                <Table.Th w="30%">List</Table.Th>
                <Table.Th w="20%">Grade</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {words.status === "loading"
                ? Array.from({ length: 8 }, (_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td colSpan={3}>
                        <Skeleton height={18} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                : words.status === "ready" &&
                  words.data.items.map((word) => (
                    <Table.Tr key={word.id}>
                      <Table.Td>
                        <Anchor component="button" fw={500} onClick={() => setDefinition({ word: word.value, category: word.category })}>
                          {word.value}
                        </Anchor>
                      </Table.Td>
                      <Table.Td>
                        <WordTag category={word.category}>{CATEGORY_INFO[word.category].label}</WordTag>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={word.grade ? undefined : "dimmed"}>
                          {word.grade ? gradeLabel(word.grade) : "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              {words.status === "ready" && words.data.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="dimmed" py="lg">
                      No words match these filters. Try another list or grade, or clear the search.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      </Surface>

      {/* The same footer as the lists in History: what's shown on the left, the pager on the right. */}
      <Group justify="space-between" mt={-16}>
        <Text size="sm" c="dimmed">
          {words.status === "ready"
            ? `${words.data.total.toLocaleString()} ${label} words${grade ? ` for ${gradeLabel(grade)}` : ""}${debounced ? ` starting with "${debounced}"` : ""}`
            : "Loading words…"}
        </Text>
        {words.status === "ready" && (
          <Pager
            page={page}
            total={words.data.totalPages}
            onChange={(next) => {
              update({ page: String(next) }, false);
              results.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        )}
      </Group>

      <DefinitionModal target={definition} onClose={() => setDefinition(null)} />
    </Stack>
  );
}
