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
import { useDebouncedCallback } from "@mantine/hooks";
import { IconArrowDown, IconArrowUp, IconInfoCircle, IconSearch, IconX } from "@tabler/icons-react";
import { CATEGORY_INFO, gradeLabel, parseGrade, parseWordCategory, type WordCategory } from "@repo/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { DefinitionModal } from "@/components/definition/definition-modal";
import type { DefinitionTarget } from "@/components/definition/definition-target";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Pager } from "@/components/ui/pager";
import { Surface } from "@/components/ui/surface";
import { WordTag } from "@/components/ui/word-tag";
import { errorMessage } from "@/lib/api-client/error-message";
import { CATEGORY_SELECT_DATA } from "@/lib/categories/category-select-data";
import { GRADE_SELECT_DATA } from "@/lib/categories/grade-select-data";
import { wordListQuery } from "../_lib/word-list-query";
import { wordLookupQuery } from "../_lib/word-lookup-query";

const PAGE_SIZES = ["20", "60", "200"];

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
  const q = searchParams.get("q") ?? "";

  // The box shows what's typed at once; the URL (and so the search) follows 300 ms after typing stops.
  const [search, setSearch] = useState(q);
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

  const searchFor = useDebouncedCallback((value: string) => {
    if (value !== q) update({ q: value || null });
  }, 300);

  function clearSearch() {
    searchFor.cancel();
    setSearch("");
    update({ q: null });
  }

  const query = new URLSearchParams({ category, sort, pageSize, page: String(page) });
  if (grade) query.set("grade", grade);
  if (q) query.set("q", q);
  const words = useQuery({ ...wordListQuery(query.toString()), placeholderData: keepPreviousData });

  // Every list the typed word appears in, whatever list is selected.
  const lookupQuery = useQuery({ ...wordLookupQuery(q), enabled: q !== "" });
  const lookup = q ? (lookupQuery.data ?? []) : [];

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
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              searchFor(event.currentTarget.value.trim());
            }}
            rightSection={search ? <IconX size={14} style={{ cursor: "pointer" }} onClick={clearSearch} aria-label="Clear search" /> : null}
          />
          <Select label="Word list" data={CATEGORY_SELECT_DATA} value={category} onChange={(value) => value && update({ category: value })} />
          <Select label="Grade" placeholder="All grades" data={GRADE_SELECT_DATA} value={grade} onChange={(value) => update({ grade: value })} clearable allowDeselect />
          <Select label="Words per page" data={PAGE_SIZES} value={pageSize} onChange={(value) => value && update({ pageSize: value })} />
        </SimpleGrid>
      </Surface>

      {lookup.length > 0 && (
        <Alert color="virsBlue" icon={<IconInfoCircle size={18} />}>
          <Group gap="xs">
            <Text size="sm">
              <Anchor component="button" inherit underline="always" onClick={() => setDefinition({ word: lookup[0]!.value })}>
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

      {words.isError && (
        <Alert color="red" icon={<IconX size={18} />} title="We couldn't load the words">
          {errorMessage(words.error)}
        </Alert>
      )}

      {/* While the next page loads, the current words stay, slightly faded (no white cover over them). */}
      <Surface p={0} style={{ opacity: words.isPlaceholderData ? 0.6 : 1, transition: "opacity 120ms ease" }}>
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
              {words.isPending
                ? Array.from({ length: 8 }, (_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td colSpan={3}>
                        <Skeleton height={18} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                : words.data?.items.map((word) => (
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
              {words.data?.items.length === 0 && (
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
          {words.data
            ? `${words.data.total.toLocaleString()} ${label} words${grade ? ` for ${gradeLabel(grade)}` : ""}${q ? ` starting with "${q}"` : ""}`
            : "Loading words…"}
        </Text>
        {words.data && (
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
