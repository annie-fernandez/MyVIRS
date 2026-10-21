"use client";

import { ActionIcon, Group, Modal, Stack, Table, Text, TextInput, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconPencil, IconSearch, IconTrash } from "@tabler/icons-react";
import { CATEGORY_INFO, gradeLabel, type AdminWordInput, type Word } from "@repo/core";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { WordTag } from "@/components/ui/word-tag";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";
import { adminWordQuery } from "../_lib/admin-word-query";
import type { Notice } from "../_lib/notice";
import { useInvalidateWordLists } from "../_lib/use-invalidate-word-lists";
import { NoticeAlert } from "./notice-alert";
import { useConfirm } from "./use-confirm";
import { WordForm } from "./word-form";

/** Every list a word is in, with edit and delete for each entry. */
export function FindWord() {
  const [search, setSearch] = useState("");
  const [value] = useDebouncedValue(search.trim(), 300);
  const [notice, setNotice] = useState<Notice>(null);
  const [editing, setEditing] = useState<Word | null>(null);
  const { confirm, dialog } = useConfirm();
  const invalidateWordLists = useInvalidateWordLists();
  const failed = (error: Error) => setNotice({ color: "red", message: errorMessage(error) });
  const deleteWord = useMutation({
    mutationFn: (word: Word) => apiFetch<void>(`/api/admin/words/${word.id}`, { method: "DELETE" }),
    onSuccess: (_data, word) => {
      setNotice({ color: "virsGreen", message: `Removed "${word.value}" from ${CATEGORY_INFO[word.category].label}.` });
      return invalidateWordLists();
    },
    onError: failed,
  });
  const editWord = useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminWordInput }) => apiFetch<Word>(`/api/admin/words/${id}`, { method: "PATCH", json: input }),
    onSuccess: (word) => {
      setNotice({ color: "virsGreen", message: `Saved "${word.value}" in ${CATEGORY_INFO[word.category].label}.` });
      return invalidateWordLists();
    },
    onError: failed,
    onSettled: () => setEditing(null),
  });
  // The table stays while the next word loads.
  const lookup = useQuery({ ...adminWordQuery(value), enabled: value !== "", placeholderData: keepPreviousData });
  const entries = value ? lookup.data : undefined;

  return (
    <Stack gap="md">
      <TextInput placeholder="Type a word to see every list it's in" leftSection={<IconSearch size={16} />} value={search} onChange={(event) => setSearch(event.currentTarget.value)} aria-label="Find a word" />
      <NoticeAlert notice={notice ?? (lookup.isError ? { color: "red", message: errorMessage(lookup.error) } : null)} />
      {value && entries?.length === 0 && (
        <Text size="sm" c="dimmed">
          &ldquo;{value}&rdquo; isn&apos;t in any list yet. Add it below.
        </Text>
      )}
      {entries && entries.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <Table miw={460} striped={false}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Word</Table.Th>
                <Table.Th>List</Table.Th>
                <Table.Th>Grade</Table.Th>
                <Table.Th w={96} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.map((word) => (
                <Table.Tr key={word.id}>
                  <Table.Td fw={500}>{word.value}</Table.Td>
                  <Table.Td>
                    <WordTag category={word.category}>{CATEGORY_INFO[word.category].label}</WordTag>
                  </Table.Td>
                  <Table.Td>{word.grade ? gradeLabel(word.grade) : "—"}</Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label="Edit">
                        <ActionIcon onClick={() => setEditing(word)} aria-label={`Edit ${word.value}`}>
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          color="red"
                          aria-label={`Delete ${word.value}`}
                          onClick={() =>
                            confirm({
                              title: `Delete "${word.value}"?`,
                              body: `This removes "${word.value}" from the ${CATEGORY_INFO[word.category].label} list. Texts analyzed afterwards won't find it there.`,
                              action: "Delete word",
                              run: () => deleteWord.mutateAsync(word).catch(() => undefined),
                            })
                          }
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      <Modal opened={editing !== null} onClose={() => setEditing(null)} title={`Edit "${editing?.value ?? ""}"`} size="lg">
        {editing && (
          <WordForm
            initialValues={{ value: editing.value, category: editing.category, grade: editing.grade }}
            submitLabel="Save"
            onSubmit={(input) => editWord.mutateAsync({ id: editing.id, input }).catch(() => undefined)}
          />
        )}
      </Modal>
      {dialog}
    </Stack>
  );
}
