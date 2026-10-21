"use client";

import { ActionIcon, Alert, Button, Group, Modal, Skeleton, Stack, Table, Text, ThemeIcon, Tooltip, UnstyledButton } from "@mantine/core";
import { IconHistory, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import type { AnalysisSourceKind, HistoryItem } from "@repo/core";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { EmptyState } from "@/components/ui/empty-state";
import { Pager } from "@/components/ui/pager";
import { Surface } from "@/components/ui/surface";
import { analysisStore } from "@/lib/analysis-store/analysis-store";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";
import { queryKeys } from "@/lib/query-keys";
import { TEXT_SOURCES, type TextSource } from "@/lib/sources";
import { historyPageQuery } from "../../_lib/history-page-query";
import { savedAnalysisQuery } from "../../_lib/saved-analysis-query";
import { formatDateTime } from "./format-date-time";
import { readability } from "./readability";

const SOURCE: Record<AnalysisSourceKind, TextSource> = {
  text: TEXT_SOURCES.text,
  document: TEXT_SOURCES.doc,
  pdf: TEXT_SOURCES.pdf,
  image: TEXT_SOURCES.image,
};

/** The saved passages, newest first: open one to see its results again, or delete it. */
export function HistoryList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<HistoryItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // The rows on screen stay while the next page loads.
  const list = useQuery({ ...historyPageQuery(page), placeholderData: keepPreviousData });

  const openAnalysis = useMutation({
    mutationFn: (id: string) => queryClient.fetchQuery(savedAnalysisQuery(id)),
    onMutate: () => setActionError(null),
    onSuccess: (saved) => {
      analysisStore.set({ result: saved.result, source: saved.title ?? SOURCE[saved.sourceKind].short.title, analyzedAt: saved.createdAt, historyId: saved.id });
      router.push("/enhanced-text-result");
    },
    onError: (caught) => setActionError(errorMessage(caught)),
  });
  // Stays set after a successful open, so the row keeps its spinner until the results screen shows.
  const opening = openAnalysis.isPending || openAnalysis.isSuccess ? openAnalysis.variables : null;

  const deleteAnalysis = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/history/${id}`, { method: "DELETE" }),
    onMutate: () => setActionError(null),
    onSuccess: async () => {
      setToDelete(null);
      // Deleting the last row of a page leaves it empty: step back one.
      if (list.data?.items.length === 1 && page > 1) setPage(page - 1);
      // The progress tab counts the passages too.
      await Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.history }), queryClient.invalidateQueries({ queryKey: queryKeys.progress })]);
    },
    onError: (caught) => {
      setToDelete(null);
      setActionError(errorMessage(caught));
    },
  });

  if (list.isError) {
    return (
      <Alert color="red" icon={<IconX size={18} />} title="We couldn't load your history">
        {errorMessage(list.error)}
      </Alert>
    );
  }

  if (list.data?.total === 0) {
    return (
      <EmptyState
        icon={IconHistory}
        title="Nothing here yet"
        description="Analyze a text while you're logged in and it shows up here."
        action={
          <Button component={ShellLink} href="/text" leftSection={<IconPlus size={16} />}>
            Analyze a text
          </Button>
        }
      />
    );
  }

  return (
    <Stack gap="md">
      {actionError && (
        <Alert color="red" icon={<IconX size={18} />} withCloseButton onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Surface p={0} style={{ overflowX: "auto" }}>
        <Table miw={640} striped={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Text</Table.Th>
              <Table.Th>Analyzed</Table.Th>
              <Table.Th>Words</Table.Th>
              <Table.Th>Readability</Table.Th>
              <Table.Th aria-label="Actions" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {list.isPending
              ? Array.from({ length: 4 }, (_, row) => (
                  <Table.Tr key={row}>
                    <Table.Td colSpan={5}>
                      <Skeleton height={22} />
                    </Table.Td>
                  </Table.Tr>
                ))
              : list.data.items.map((item) => {
                  const source = SOURCE[item.sourceKind];
                  return (
                    <Table.Tr key={item.id}>
                      <Table.Td maw={360}>
                        <UnstyledButton onClick={() => openAnalysis.mutate(item.id)} disabled={opening !== null} style={{ display: "block", width: "100%" }} aria-label={`Open ${item.title ?? "this analysis"}`}>
                          <Group gap="sm" wrap="nowrap">
                            <Tooltip label={source.short.title}>
                              <ThemeIcon variant="light" color={source.color} size="md">
                                <source.icon size={16} stroke={1.8} />
                              </ThemeIcon>
                            </Tooltip>
                            <Text fw={600} truncate c={opening === item.id ? "dimmed" : undefined}>
                              {item.title ?? "Untitled text"}
                            </Text>
                          </Group>
                        </UnstyledButton>
                      </Table.Td>
                      <Table.Td style={{ whiteSpace: "nowrap" }}>{formatDateTime(item.createdAt)}</Table.Td>
                      <Table.Td>{item.wordCount.toLocaleString()}</Table.Td>
                      <Table.Td style={{ whiteSpace: "nowrap" }}>{readability(item)}</Table.Td>
                      <Table.Td>
                        {/* Open and delete share one height so the pair sits level in the row. */}
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          <Button variant="light" size="xs" h={30} px="md" loading={opening === item.id} disabled={opening !== null && opening !== item.id} onClick={() => openAnalysis.mutate(item.id)}>
                            Open
                          </Button>
                          <Tooltip label="Delete from history">
                            <ActionIcon color="red" size={30} aria-label={`Delete ${item.title ?? "this analysis"}`} onClick={() => setToDelete(item)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
          </Table.Tbody>
        </Table>
      </Surface>

      {list.data && list.data.totalPages > 1 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {list.data.total.toLocaleString()} saved
          </Text>
          <Pager page={page} total={list.data.totalPages} onChange={setPage} />
        </Group>
      )}

      <Modal opened={toDelete !== null} onClose={() => setToDelete(null)} title="Delete this analysis?">
        <Stack gap="md">
          <Text>
            <b>{toDelete?.title ?? "This text"}</b> and its results will be removed from your history. This can&apos;t be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setToDelete(null)}>
              Keep it
            </Button>
            <Button color="red" loading={deleteAnalysis.isPending} onClick={() => toDelete && deleteAnalysis.mutate(toDelete.id)}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
