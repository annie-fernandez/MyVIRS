"use client";

import { ActionIcon, Alert, Button, Group, Modal, Pagination, Skeleton, Stack, Table, Text, ThemeIcon, Tooltip, UnstyledButton } from "@mantine/core";
import { IconHistory, IconLogin, IconPlus, IconTrash, IconUserPlus, IconX } from "@tabler/icons-react";
import { READING_LEVEL_LABELS, readingLevel, type AnalysisSourceKind, type Paginated } from "@repo/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SavedAnalysis } from "@/app/api/history/[id]/route";
import { ShellLink } from "@/components/layout/shell-link";
import { EmptyState, Marker, PageHeader, Surface } from "@/components/ui";
import { useAnalysis } from "@/lib/analysis-store";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { TEXT_SOURCES, type TextSource } from "@/lib/sources";

/** One row of GET /api/history. */
interface HistoryItem {
  id: string;
  createdAt: string;
  sourceKind: AnalysisSourceKind;
  title: string | null;
  sentenceCount: number;
  fleschReadingScore: number;
  wordCount: number;
}

const PAGE_SIZE = 10;

const SOURCE: Record<AnalysisSourceKind, TextSource> = {
  text: TEXT_SOURCES.text,
  document: TEXT_SOURCES.doc,
  pdf: TEXT_SOURCES.pdf,
  image: TEXT_SOURCES.image,
};

const formatDate = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function readability(item: HistoryItem): string {
  const level = readingLevel(item.fleschReadingScore, item.wordCount);
  return level === "too-short" || level === "needs-more-sentences" ? "Too short to score" : `${item.fleschReadingScore.toFixed(0)} · ${READING_LEVEL_LABELS[level]}`;
}

/** The signed-in user's saved analyses. Signed-out visitors are told history needs an account. */
export function HistoryScreen({ signedIn }: { signedIn: boolean }) {
  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Your <Marker>history</Marker>
          </>
        }
        description="Every text you analyze while logged in is kept here, with the results exactly as they were that day."
      />
      {signedIn ? <HistoryList /> : <SignedOut />}
    </Stack>
  );
}

function SignedOut() {
  return (
    <EmptyState
      icon={IconHistory}
      title="Log in to keep a history"
      description="Analyzing works without an account, but nothing is saved. With a free account, every text you analyze is kept here so you can come back to it."
      action={
        <Group justify="center" gap="sm">
          {/* ?login=1 and ?register=1 open the account pop-ups (see AccountMenu). */}
          <Button component={ShellLink} href="/history?register=1" variant="default" leftSection={<IconUserPlus size={16} />}>
            Create an account
          </Button>
          <Button component={ShellLink} href="/history?login=1" leftSection={<IconLogin size={16} />}>
            Log in
          </Button>
        </Group>
      }
    />
  );
}

type ListState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: Paginated<HistoryItem> };

function HistoryList() {
  const router = useRouter();
  const { setAnalysis } = useAnalysis();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [opening, setOpening] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (target: number) => {
    try {
      const data = await apiFetch<Paginated<HistoryItem>>(`/api/history?page=${target}&pageSize=${PAGE_SIZE}`);
      // Deleting the last row of the last page leaves that page empty: step back one.
      if (data.items.length === 0 && target > 1) setPage(target - 1);
      else setList({ status: "ready", data });
    } catch (caught) {
      setList({ status: "error", message: errorMessage(caught) });
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  async function open(item: HistoryItem) {
    setActionError(null);
    setOpening(item.id);
    try {
      const saved = await apiFetch<SavedAnalysis>(`/api/history/${item.id}`);
      setAnalysis({ result: saved.result, source: saved.title ?? SOURCE[saved.sourceKind].short.title, analyzedAt: saved.createdAt, historyId: saved.id });
      router.push("/enhanced-text-result");
    } catch (caught) {
      setActionError(errorMessage(caught));
      setOpening(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiFetch(`/api/history/${toDelete.id}`, { method: "DELETE" });
      setToDelete(null);
      await load(page);
    } catch (caught) {
      setToDelete(null);
      setActionError(errorMessage(caught));
    }
    setDeleting(false);
  }

  if (list.status === "error") {
    return (
      <Alert color="red" icon={<IconX size={18} />} title="We couldn't load your history">
        {list.message}
      </Alert>
    );
  }

  if (list.status === "ready" && list.data.total === 0) {
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
              <Table.Th ta="right">Words</Table.Th>
              <Table.Th>Readability</Table.Th>
              <Table.Th aria-label="Actions" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {list.status === "loading"
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
                        <UnstyledButton onClick={() => open(item)} disabled={opening !== null} style={{ display: "block", width: "100%" }} aria-label={`Open ${item.title ?? "this analysis"}`}>
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
                      <Table.Td style={{ whiteSpace: "nowrap" }}>{formatDate(item.createdAt)}</Table.Td>
                      <Table.Td ta="right">{item.wordCount.toLocaleString()}</Table.Td>
                      <Table.Td style={{ whiteSpace: "nowrap" }}>{readability(item)}</Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Button variant="default" size="compact-sm" loading={opening === item.id} disabled={opening !== null && opening !== item.id} onClick={() => open(item)}>
                            Open
                          </Button>
                          <Tooltip label="Delete from history">
                            <ActionIcon color="red" aria-label={`Delete ${item.title ?? "this analysis"}`} onClick={() => setToDelete(item)}>
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

      {list.status === "ready" && list.data.totalPages > 1 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {list.data.total.toLocaleString()} saved
          </Text>
          <Pagination total={list.data.totalPages} value={page} onChange={setPage} siblings={1} boundaries={1} />
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
            <Button color="red" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
