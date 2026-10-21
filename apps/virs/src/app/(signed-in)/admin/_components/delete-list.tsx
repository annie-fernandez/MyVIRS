"use client";

import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { CATEGORY_INFO, type WordCategory } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";
import { CATEGORY_SELECT_DATA } from "@/lib/categories/category-select-data";
import type { Notice } from "../_lib/notice";
import { useInvalidateWordLists } from "../_lib/use-invalidate-word-lists";
import { NoticeAlert } from "./notice-alert";
import { useConfirm } from "./use-confirm";

/** Empties a whole list, after a confirmation. */
export function DeleteList() {
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const { confirm, dialog } = useConfirm();
  const invalidateWordLists = useInvalidateWordLists();
  const deleteList = useMutation({
    mutationFn: (target: WordCategory) => apiFetch<{ deleted: number }>(`/api/admin/words?category=${target}`, { method: "DELETE" }),
    onSuccess: ({ deleted }, target) => {
      setCategory(null);
      setNotice({ color: "virsGreen", message: `Deleted ${deleted.toLocaleString()} words from ${CATEGORY_INFO[target].label}.` });
      return invalidateWordLists();
    },
    onError: (error) => setNotice({ color: "red", message: errorMessage(error) }),
  });
  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Removes every word from one list. The list stays empty until you import it again.
      </Text>
      <Group align="flex-end" gap="sm">
        <Select label="Word list" placeholder="Choose a list" data={CATEGORY_SELECT_DATA} value={category} onChange={(value) => setCategory(value as WordCategory | null)} style={{ flex: 1 }} />
        <Button
          color="red"
          variant="light"
          leftSection={<IconTrash size={16} />}
          disabled={!category}
          onClick={() =>
            confirm({
              title: `Delete every word in ${CATEGORY_INFO[category!].label}?`,
              body: `All ${CATEGORY_INFO[category!].label} words will be removed, and texts analyzed afterwards won't find any. Export a backup first if you might need them.`,
              action: "Delete all words",
              run: () => deleteList.mutateAsync(category!).catch(() => undefined),
            })
          }
        >
          Delete list
        </Button>
      </Group>
      <NoticeAlert notice={notice} />
      {dialog}
    </Stack>
  );
}
