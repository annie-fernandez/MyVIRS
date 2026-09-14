"use client";

import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Pagination,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconDownload,
  IconInfoCircle,
  IconListSearch,
  IconSearch,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import {
  CATEGORY_INFO,
  GRADES,
  gradeLabel,
  parseGrade,
  parseWordCategory,
  type Paginated,
  type Word,
  type WordCategory,
} from "@repo/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DefinitionModal, type DefinitionTarget } from "@/components/dictionary/definition-modal";
import { PageHeader } from "@/components/page-header";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { CATEGORY_COLORS, CATEGORY_SELECT_DATA } from "@/lib/categories-ui";

const PAGE_SIZES = ["20", "60", "200", "1000"];
const GRADE_SELECT_DATA = GRADES.map((grade) => ({ value: grade, label: gradeLabel(grade) }));

export function WordSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category: WordCategory = parseWordCategory(searchParams.get("category") ?? "") ?? "k1";
  const grade = parseGrade(searchParams.get("grade") ?? "") ?? null;
  const sort = searchParams.get("sort") === "desc" ? "desc" : "asc";
  const pageSize = PAGE_SIZES.includes(searchParams.get("pageSize") ?? "") ? searchParams.get("pageSize")! : "20";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);
  const [definition, setDefinition] = useState<DefinitionTarget | null>(null);

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
    if (debouncedSearch !== (searchParams.get("q") ?? "")) update({ q: debouncedSearch || null });
    // Only react to the debounced input; `update` reads the latest params itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = new URLSearchParams({ category, sort, pageSize, page: String(page) });
  if (grade) query.set("grade", grade);
  if (debouncedSearch) query.set("q", debouncedSearch);

  const words = useQuery({
    queryKey: ["words", query.toString()],
    queryFn: () => apiFetch<Paginated<Word>>(`/api/words?${query.toString()}`),
    placeholderData: keepPreviousData,
  });

  const exact = useQuery({
    queryKey: ["word-lookup", debouncedSearch.toLowerCase()],
    queryFn: async () => {
      try {
        return await apiFetch<Word[]>(`/api/words/${encodeURIComponent(debouncedSearch)}`);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) return [];
        throw error;
      }
    },
    enabled: debouncedSearch.length > 0,
  });

  return (
    <Container size="lg">
      <PageHeader
        title="Search word lists"
        description="Browse the K-12 school dictionary by list and grade. Each K list contains 1,000 words ordered by frequency."
        icon={<IconListSearch size={24} />}
        actions={
          <Button
            component="a"
            href={`/api/words/export?categories=${category}`}
            variant="default"
            leftSection={<IconDownload size={16} />}
          >
            Download {CATEGORY_INFO[category].label}
          </Button>
        }
      />

      <Stack gap="md">
        <Card withBorder padding="md">
          <Group gap="sm" align="flex-end">
            <TextInput
              label="Word"
              placeholder="Starts with…"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              style={{ flex: "1 1 220px" }}
            />
            <Select
              label="Word list"
              data={CATEGORY_SELECT_DATA}
              value={category}
              onChange={(value) => value && update({ category: value })}
              allowDeselect={false}
              w={200}
            />
            <Select
              label="Grade"
              placeholder="All grades"
              data={GRADE_SELECT_DATA}
              value={grade}
              onChange={(value) => update({ grade: value })}
              clearable
              w={160}
            />
            <Select
              label="Per page"
              data={PAGE_SIZES}
              value={pageSize}
              onChange={(value) => value && update({ pageSize: value })}
              allowDeselect={false}
              w={100}
            />
            <SegmentedControl
              value={sort}
              onChange={(value) => update({ sort: value })}
              data={[
                { value: "asc", label: <IconSortAscendingLetters size={18} aria-label="A to Z" /> },
                { value: "desc", label: <IconSortDescendingLetters size={18} aria-label="Z to A" /> },
              ]}
            />
          </Group>
        </Card>

        {debouncedSearch && exact.data && exact.data.length > 0 && (
          <Alert variant="light" icon={<IconInfoCircle size={18} />}>
            <Group gap="xs">
              <Text size="sm">
                <Anchor component="button" onClick={() => setDefinition({ word: debouncedSearch })}>
                  {exact.data[0]!.value}
                </Anchor>{" "}
                appears in:
              </Text>
              {exact.data.map((entry) => (
                <Badge key={entry.id} color={CATEGORY_COLORS[entry.category]} variant="light" tt="none">
                  {CATEGORY_INFO[entry.category].label}
                  {entry.grade ? ` · ${gradeLabel(entry.grade)}` : ""}
                </Badge>
              ))}
            </Group>
          </Alert>
        )}

        {words.isError && <Alert color="red">{words.error.message}</Alert>}

        <Card withBorder padding={0} pos="relative">
          <LoadingOverlay visible={words.isFetching && !words.isPending} overlayProps={{ blur: 1 }} />
          <Group justify="space-between" px="md" py="sm">
            <Text size="sm" c="dimmed">
              {words.data
                ? `${words.data.total.toLocaleString("en-US")} ${CATEGORY_INFO[category].label} words${grade ? ` for ${gradeLabel(grade)}` : ""}`
                : "Loading…"}
            </Text>
          </Group>
          <Table.ScrollContainer minWidth={420}>
            <Table striped highlightOnHover verticalSpacing="xs" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Word</Table.Th>
                  <Table.Th>List</Table.Th>
                  <Table.Th>Grade</Table.Th>
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
                          <Badge color={CATEGORY_COLORS[word.category]} variant="light">
                            {CATEGORY_INFO[word.category].label}
                          </Badge>
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
                        No words match these filters.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {words.data && words.data.totalPages > 1 && (
            <Group justify="center" p="md">
              <Pagination
                total={words.data.totalPages}
                value={page}
                onChange={(next) => update({ page: String(next) }, false)}
                siblings={1}
                boundaries={1}
              />
            </Group>
          )}
        </Card>
      </Stack>

      <DefinitionModal target={definition} onClose={() => setDefinition(null)} />
    </Container>
  );
}
