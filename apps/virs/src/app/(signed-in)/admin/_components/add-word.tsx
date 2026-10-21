"use client";

import { Stack } from "@mantine/core";
import { CATEGORY_INFO, parseWordCategory, type AdminWordInput } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";
import type { Notice } from "../_lib/notice";
import { useInvalidateWordLists } from "../_lib/use-invalidate-word-lists";
import { NoticeAlert } from "./notice-alert";
import { WordForm } from "./word-form";

export function AddWord() {
  const [notice, setNotice] = useState<Notice>(null);
  const invalidateWordLists = useInvalidateWordLists();
  const addWord = useMutation({
    // This endpoint is shared with the legacy Angular admin page, so it answers in the old format
    // (categories in capitals, e.g. "K1"); onSuccess normalizes before looking up the label.
    mutationFn: (input: AdminWordInput) => apiFetch<{ value: string; category: string }>("/api/admin/words", { method: "POST", json: input }),
    onSuccess: (word, input) => {
      const category = parseWordCategory(word.category) ?? input.category;
      setNotice({ color: "virsGreen", message: `Added "${word.value}" to ${CATEGORY_INFO[category].label}.` });
      return invalidateWordLists();
    },
    onError: (error) => setNotice({ color: "red", message: errorMessage(error) }),
  });
  return (
    <Stack gap="md">
      <WordForm
        initialValues={{ value: "", category: null, grade: null }}
        submitLabel="Add word"
        // The form clears only when the word was added; a failure shows in the notice.
        onSubmit={(input, reset) => addWord.mutateAsync(input).then(reset, () => undefined)}
      />
      <NoticeAlert notice={notice} />
    </Stack>
  );
}
