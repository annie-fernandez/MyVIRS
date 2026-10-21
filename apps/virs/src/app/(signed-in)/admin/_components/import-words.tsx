"use client";

import { Alert, Button, FileInput, Group, List, Select, Stack, Switch, Text } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconFileUpload, IconX } from "@tabler/icons-react";
import { CATEGORY_INFO, type WordCategory } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";
import { CATEGORY_SELECT_DATA } from "@/lib/categories/category-select-data";
import { useInvalidateWordLists } from "../_lib/use-invalidate-word-lists";
import { useConfirm } from "./use-confirm";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { line: number; message: string }[];
}

/** Imports a CSV of words, adding to a list or replacing it. */
export function ImportWords() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [replace, setReplace] = useState(false);
  const { confirm, dialog } = useConfirm();
  const invalidateWordLists = useInvalidateWordLists();
  const importWords = useMutation({
    mutationFn: (form: FormData) => apiFetch<ImportResult>("/api/admin/words/import", { method: "POST", body: form }),
    onSuccess: async () => {
      setFile(null);
      await invalidateWordLists();
    },
  });
  const result = importWords.data;

  async function upload() {
    const form = new FormData();
    form.set("file", file!);
    if (category) form.set("category", category);
    form.set("replace", String(replace));
    // Errors show from the mutation's state, below.
    await importWords.mutateAsync(form).catch(() => undefined);
  }

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Use a <code>value,category,grade</code> header, or one word per line with a list chosen below.
      </Text>
      <FileInput label="CSV file" placeholder="Choose a .csv file" accept=".csv,text/csv" leftSection={<IconFileUpload size={16} />} value={file} onChange={setFile} />
      <Select
        label="Put every word in"
        description="Leave empty to use the file's category column."
        placeholder="The file's category column"
        data={CATEGORY_SELECT_DATA}
        value={category}
        onChange={(value) => {
          setCategory(value as WordCategory | null);
          if (!value) setReplace(false);
        }}
        clearable
        allowDeselect
      />
      <Switch label="Replace the words already in this list" checked={replace} disabled={!category} onChange={(event) => setReplace(event.currentTarget.checked)} />
      <Group justify="flex-end">
        <Button
          disabled={!file}
          loading={importWords.isPending}
          color={replace ? "red" : undefined}
          variant={replace ? "light" : "filled"}
          leftSection={<IconFileUpload size={16} />}
          onClick={() =>
            replace
              ? confirm({
                  title: `Replace the ${CATEGORY_INFO[category!].label} list?`,
                  body: (
                    <>
                      Every word now in {CATEGORY_INFO[category!].label} will be deleted and replaced by the words in <b>{file!.name}</b>. Export a backup first if you might need the current list.
                    </>
                  ),
                  action: "Replace list",
                  run: upload,
                })
              : upload()
          }
        >
          {replace ? "Replace list" : "Import"}
        </Button>
      </Group>
      {result && (
        <Alert color={result.skipped > 0 ? "virsOrange" : "virsGreen"} icon={result.skipped > 0 ? <IconAlertTriangle size={18} /> : <IconCheck size={18} />} title={`${result.imported.toLocaleString()} words imported`}>
          {result.skipped > 0 ? (
            <>
              <Text size="sm" mb={4}>
                {result.skipped} rows were skipped:
              </Text>
              <List size="xs">
                {result.errors.map((rowError) => (
                  <List.Item key={rowError.line}>
                    Line {rowError.line}: {rowError.message}
                  </List.Item>
                ))}
              </List>
            </>
          ) : (
            "Every row was imported."
          )}
        </Alert>
      )}
      {importWords.isError && (
        <Alert color="red" icon={<IconX size={18} />} title="The import didn't run">
          {errorMessage(importWords.error)}
        </Alert>
      )}
      {dialog}
    </Stack>
  );
}
