"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Container,
  FileInput,
  Group,
  List,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  IconDatabaseExport,
  IconFileUpload,
  IconPencil,
  IconSearch,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { CATEGORY_INFO, gradeLabel, type AdminWordInput, type Word, type WordCategory } from "@repo/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api-client";
import { CATEGORY_COLORS, CATEGORY_SELECT_DATA } from "@/lib/categories-ui";
import { WordForm } from "./word-form";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { line: number; message: string }[];
}

function useInvalidateWords() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-words"] }),
      queryClient.invalidateQueries({ queryKey: ["words"] }),
      queryClient.invalidateQueries({ queryKey: ["word-lookup"] }),
    ]);
}

function WordLookupCard() {
  const invalidate = useInvalidateWords();
  const [search, setSearch] = useState("");
  const [value] = useDebouncedValue(search.trim(), 300);
  const [editing, setEditing] = useState<Word | null>(null);

  const entries = useQuery({
    queryKey: ["admin-words", value.toLowerCase()],
    queryFn: () => apiFetch<Word[]>(`/api/admin/words?value=${encodeURIComponent(value)}`),
    enabled: value.length > 0,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminWordInput }) =>
      apiFetch<Word>(`/api/admin/words/${id}`, { method: "PATCH", json: input }),
    onSuccess: async (word) => {
      setEditing(null);
      await invalidate();
      notifications.show({ color: "teal", message: `Saved "${word.value}" in ${CATEGORY_INFO[word.category].label}.` });
    },
    onError: (error) => notifications.show({ color: "red", title: "Could not save", message: error.message }),
  });

  const remove = useMutation({
    mutationFn: (word: Word) => apiFetch<void>(`/api/admin/words/${word.id}`, { method: "DELETE" }),
    onSuccess: async (_, word) => {
      await invalidate();
      notifications.show({ message: `Removed "${word.value}" from ${CATEGORY_INFO[word.category].label}.` });
    },
    onError: (error) => notifications.show({ color: "red", title: "Could not delete", message: error.message }),
  });

  function confirmDelete(word: Word) {
    modals.openConfirmModal({
      title: `Delete "${word.value}"?`,
      children: <Text size="sm">This removes the word from the {CATEGORY_INFO[word.category].label} list.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => remove.mutate(word),
    });
  }

  return (
    <Card withBorder padding="lg">
      <Title order={4} mb="md">
        Find a word
      </Title>
      <TextInput
        placeholder="Type a word to see every list it belongs to"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        mb="md"
      />
      {entries.isError && <Alert color="red">{entries.error.message}</Alert>}
      {value && entries.data?.length === 0 && (
        <Text c="dimmed" size="sm">
          &ldquo;{value}&rdquo; is not in any list yet.
        </Text>
      )}
      {entries.data && entries.data.length > 0 && (
        <Table.ScrollContainer minWidth={420}>
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Word</Table.Th>
                <Table.Th>List</Table.Th>
                <Table.Th>Grade</Table.Th>
                <Table.Th w={90} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.data.map((word) => (
                <Table.Tr key={word.id}>
                  <Table.Td fw={500}>{word.value}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={CATEGORY_COLORS[word.category]}>
                      {CATEGORY_INFO[word.category].label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{word.grade ? gradeLabel(word.grade) : "—"}</Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label="Edit">
                        <ActionIcon variant="subtle" onClick={() => setEditing(word)} aria-label={`Edit ${word.value}`}>
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(word)} aria-label={`Delete ${word.value}`}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal opened={editing !== null} onClose={() => setEditing(null)} title="Edit word">
        {editing && (
          <WordForm
            initialValues={{ value: editing.value, category: editing.category, grade: editing.grade }}
            submitLabel="Save"
            loading={update.isPending}
            onSubmit={(input) => update.mutate({ id: editing.id, input })}
          />
        )}
      </Modal>
    </Card>
  );
}

function AddWordCard() {
  const invalidate = useInvalidateWords();
  const create = useMutation({
    mutationFn: (input: AdminWordInput) => apiFetch<Word>("/api/admin/words", { method: "POST", json: input }),
  });

  return (
    <Card withBorder padding="lg">
      <Title order={4}>Add a word</Title>
      <Text size="sm" c="dimmed" mb="md">
        Adding a word that already exists in the list updates its grade.
      </Text>
      <WordForm
        inline
        initialValues={{ value: "", category: null, grade: null }}
        submitLabel="Add word"
        loading={create.isPending}
        onSubmit={(input, reset) =>
          create.mutate(input, {
            onSuccess: async (word) => {
              reset();
              await invalidate();
              notifications.show({ color: "teal", message: `Added "${word.value}" to ${CATEGORY_INFO[word.category].label}.` });
            },
            onError: (error) => notifications.show({ color: "red", title: "Could not add word", message: error.message }),
          })
        }
      />
    </Card>
  );
}

function ImportCard() {
  const invalidate = useInvalidateWords();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [replace, setReplace] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const upload = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.set("file", file!);
      if (category) form.set("category", category);
      form.set("replace", String(replace));
      return apiFetch<ImportResult>("/api/admin/words/import", { method: "POST", body: form });
    },
    onSuccess: async (data) => {
      setResult(data);
      setFile(null);
      await invalidate();
      notifications.show({ color: "teal", title: "Import finished", message: `${data.imported.toLocaleString("en-US")} words imported.` });
    },
    onError: (error) => notifications.show({ color: "red", title: "Import failed", message: error.message }),
  });

  function submit() {
    setResult(null);
    if (!replace) return upload.mutate();
    modals.openConfirmModal({
      title: `Replace the ${CATEGORY_INFO[category!].label} list?`,
      children: (
        <Text size="sm">
          Every word currently in {CATEGORY_INFO[category!].label} will be deleted and replaced by the words in{" "}
          <b>{file!.name}</b>. This happens in a single transaction.
        </Text>
      ),
      labels: { confirm: "Replace list", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => upload.mutate(),
    });
  }

  return (
    <Card withBorder padding="lg">
      <Title order={4}>Import from CSV</Title>
      <Text size="sm" c="dimmed" mb="md">
        Use a <code>value,category,grade</code> header, or one word per line with a list chosen below.
      </Text>
      <Stack gap="sm">
        <FileInput
          label="CSV file"
          placeholder="Choose a .csv file"
          accept=".csv,text/csv"
          leftSection={<IconFileUpload size={16} />}
          value={file}
          onChange={setFile}
          clearable
        />
        <Select
          label="Put every word in"
          description="Leave empty to use the category column of the file"
          data={CATEGORY_SELECT_DATA}
          value={category}
          onChange={(value) => {
            setCategory(value as WordCategory | null);
            if (!value) setReplace(false);
          }}
          clearable
          placeholder="Category column"
        />
        <Switch
          label="Replace the existing words in this list"
          checked={replace}
          disabled={!category}
          onChange={(event) => setReplace(event.currentTarget.checked)}
        />
        <Group justify="flex-end">
          <Button disabled={!file} loading={upload.isPending} onClick={submit} color={replace ? "red" : undefined}>
            {replace ? "Replace list" : "Import"}
          </Button>
        </Group>
        {result && result.skipped > 0 && (
          <Alert color="yellow" title={`${result.skipped} rows skipped`}>
            <List size="xs">
              {result.errors.map((error) => (
                <List.Item key={error.line}>
                  Line {error.line}: {error.message}
                </List.Item>
              ))}
            </List>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}

function DeleteListCard() {
  const invalidate = useInvalidateWords();
  const [category, setCategory] = useState<WordCategory | null>(null);

  const removeList = useMutation({
    mutationFn: (target: WordCategory) =>
      apiFetch<{ deleted: number }>(`/api/admin/words?category=${target}`, { method: "DELETE" }),
    onSuccess: async ({ deleted }, target) => {
      setCategory(null);
      await invalidate();
      notifications.show({ message: `Deleted ${deleted.toLocaleString("en-US")} words from ${CATEGORY_INFO[target].label}.` });
    },
    onError: (error) => notifications.show({ color: "red", title: "Could not delete list", message: error.message }),
  });

  function confirm() {
    const target = category!;
    modals.openConfirmModal({
      title: `Delete every word in ${CATEGORY_INFO[target].label}?`,
      children: <Text size="sm">The list will be empty until you import it again. Export a backup first if you need one.</Text>,
      labels: { confirm: "Delete all words", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => removeList.mutate(target),
    });
  }

  return (
    <Card withBorder padding="lg" style={{ borderColor: "var(--mantine-color-red-outline)" }}>
      <Title order={4} c="red">
        Delete a list
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Remove every word from one list.
      </Text>
      <Group align="flex-end">
        <Select
          label="Word list"
          data={CATEGORY_SELECT_DATA}
          value={category}
          onChange={(value) => setCategory(value as WordCategory | null)}
          placeholder="Choose a list"
          style={{ flex: 1 }}
        />
        <Button color="red" variant="light" disabled={!category} loading={removeList.isPending} onClick={confirm}>
          Delete list
        </Button>
      </Group>
    </Card>
  );
}

export function AdminWordsView() {
  return (
    <Container size="lg">
      <PageHeader
        title="Manage words"
        description="Add, edit and import the words used to analyze texts."
        icon={<IconSettings size={24} />}
        actions={
          <Button component="a" href="/api/admin/words/export" variant="default" leftSection={<IconDatabaseExport size={16} />}>
            Export all words
          </Button>
        }
      />
      <Stack gap="lg">
        <WordLookupCard />
        <AddWordCard />
        <SimpleGrid cols={{ base: 1, md: 2 }} style={{ alignItems: "start" }}>
          <ImportCard />
          <DeleteListCard />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
