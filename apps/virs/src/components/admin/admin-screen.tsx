"use client";

import {
  ActionIcon,
  Alert,
  Button,
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
  Tooltip,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertTriangle, IconCheck, IconDatabaseExport, IconFileUpload, IconPencil, IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { adminWordInput, CATEGORY_INFO, gradeLabel, parseWordCategory, type AdminWordInput, type Grade, type Word, type WordCategory } from "@repo/core";
import { useEffect, useState, type ReactNode } from "react";
import { Marker, PageHeader, Section, Surface, WordTag } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { CATEGORY_SELECT_DATA, GRADE_SELECT_DATA } from "@/lib/categories";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { line: number; message: string }[];
}

type Notice = { color: "virsGreen" | "red"; message: ReactNode } | null;

function NoticeAlert({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <Alert color={notice.color} icon={notice.color === "red" ? <IconX size={18} /> : <IconCheck size={18} />}>
      {notice.message}
    </Alert>
  );
}

interface ConfirmState {
  title: string;
  body: ReactNode;
  action: string;
  run: () => Promise<void>;
}

/** One confirm dialog for every destructive admin action; it names what will be lost. */
function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);
  const dialog = (
    <Modal opened={state !== null} onClose={() => setState(null)} title={state?.title}>
      <Stack gap="md">
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {state?.body}
        </Alert>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setState(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await state?.run();
              setBusy(false);
              setState(null);
            }}
          >
            {state?.action}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
  return { confirm: setState, dialog };
}

interface WordFormValues {
  value: string;
  category: WordCategory | null;
  grade: Grade | null;
}

function WordForm({ initialValues, submitLabel, onSubmit }: { initialValues: WordFormValues; submitLabel: string; onSubmit: (input: AdminWordInput, reset: () => void) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const form = useForm<WordFormValues, AdminWordInput>({
    mode: "uncontrolled",
    initialValues,
    validate: schemaResolver(adminWordInput, { sync: true }),
    transformValues: (values) => adminWordInput.parse(values),
  });
  return (
    <form
      onSubmit={form.onSubmit(async (input) => {
        setSaving(true);
        await onSubmit(input, form.reset);
        setSaving(false);
      })}
    >
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm" style={{ alignItems: "end" }}>
        <TextInput label="Word" placeholder="e.g. photosynthesis" key={form.key("value")} {...form.getInputProps("value")} />
        <Select label="Word list" placeholder="Choose a list" data={CATEGORY_SELECT_DATA} key={form.key("category")} {...form.getInputProps("category")} />
        <Select label="Grade" placeholder="No grade" data={GRADE_SELECT_DATA} clearable allowDeselect key={form.key("grade")} {...form.getInputProps("grade")} />
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </SimpleGrid>
    </form>
  );
}

function FindWord({ revision, onChanged }: { revision: number; onChanged: () => void }) {
  const [search, setSearch] = useState("");
  const [value] = useDebouncedValue(search.trim(), 300);
  const [entries, setEntries] = useState<Word[] | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [editing, setEditing] = useState<Word | null>(null);
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    if (!value) {
      setEntries(null);
      return;
    }
    let cancelled = false;
    apiFetch<Word[]>(`/api/admin/words?value=${encodeURIComponent(value)}`)
      .then((data) => !cancelled && setEntries(data))
      .catch((error: unknown) => !cancelled && setNotice({ color: "red", message: errorMessage(error) }));
    return () => {
      cancelled = true;
    };
  }, [value, revision]);

  return (
    <Stack gap="md">
      <TextInput placeholder="Type a word to see every list it's in" leftSection={<IconSearch size={16} />} value={search} onChange={(event) => setSearch(event.currentTarget.value)} aria-label="Find a word" />
      <NoticeAlert notice={notice} />
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
                              run: async () => {
                                try {
                                  await apiFetch<void>(`/api/admin/words/${word.id}`, { method: "DELETE" });
                                  setNotice({ color: "virsGreen", message: `Removed "${word.value}" from ${CATEGORY_INFO[word.category].label}.` });
                                  onChanged();
                                } catch (error) {
                                  setNotice({ color: "red", message: errorMessage(error) });
                                }
                              },
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
            onSubmit={async (input) => {
              try {
                const word = await apiFetch<Word>(`/api/admin/words/${editing.id}`, { method: "PATCH", json: input });
                setEditing(null);
                setNotice({ color: "virsGreen", message: `Saved "${word.value}" in ${CATEGORY_INFO[word.category].label}.` });
                onChanged();
              } catch (error) {
                setNotice({ color: "red", message: errorMessage(error) });
                setEditing(null);
              }
            }}
          />
        )}
      </Modal>
      {dialog}
    </Stack>
  );
}

function AddWord({ onChanged }: { onChanged: () => void }) {
  const [notice, setNotice] = useState<Notice>(null);
  return (
    <Stack gap="md">
      <WordForm
        initialValues={{ value: "", category: null, grade: null }}
        submitLabel="Add word"
        onSubmit={async (input, reset) => {
          try {
            // This endpoint is shared with the legacy Angular admin page, so it answers in the old
            // format (categories in capitals, e.g. "K1"); normalize before looking up the label.
            const word = await apiFetch<{ value: string; category: string }>("/api/admin/words", { method: "POST", json: input });
            const category = parseWordCategory(word.category) ?? input.category;
            reset();
            setNotice({ color: "virsGreen", message: `Added "${word.value}" to ${CATEGORY_INFO[category].label}.` });
            onChanged();
          } catch (error) {
            setNotice({ color: "red", message: errorMessage(error) });
          }
        }}
      />
      <NoticeAlert notice={notice} />
    </Stack>
  );
}

function ImportWords({ onChanged }: { onChanged: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  async function upload() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.set("file", file!);
      if (category) form.set("category", category);
      form.set("replace", String(replace));
      setResult(await apiFetch<ImportResult>("/api/admin/words/import", { method: "POST", body: form }));
      setFile(null);
      onChanged();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
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
          loading={busy}
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
      {error && (
        <Alert color="red" icon={<IconX size={18} />} title="The import didn't run">
          {error}
        </Alert>
      )}
      {dialog}
    </Stack>
  );
}

function DeleteList({ onChanged }: { onChanged: () => void }) {
  const [category, setCategory] = useState<WordCategory | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const { confirm, dialog } = useConfirm();
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
              run: async () => {
                try {
                  const target = category!;
                  const { deleted } = await apiFetch<{ deleted: number }>(`/api/admin/words?category=${target}`, { method: "DELETE" });
                  setCategory(null);
                  setNotice({ color: "virsGreen", message: `Deleted ${deleted.toLocaleString()} words from ${CATEGORY_INFO[target].label}.` });
                  onChanged();
                } catch (error) {
                  setNotice({ color: "red", message: errorMessage(error) });
                }
              },
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

export function AdminScreen() {
  // Bumped after every change so the lookup table re-fetches.
  const [revision, setRevision] = useState(0);
  const changed = () => setRevision((value) => value + 1);

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Manage the word <Marker>lists</Marker>
          </>
        }
        description="Add, edit, import and remove the words VIRS uses to analyze texts. Changes apply to every analysis right away."
        actions={
          <Button component="a" href="/api/admin/words/export" variant="default" leftSection={<IconDatabaseExport size={16} />}>
            Export every word
          </Button>
        }
      />
      <Section title="Find a word">
        <Surface>
          <FindWord revision={revision} onChanged={changed} />
        </Surface>
      </Section>
      <Section title="Add a word" description="Adding a word that's already in the list updates its grade.">
        <Surface>
          <AddWord onChanged={changed} />
        </Surface>
      </Section>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ alignItems: "start" }}>
        <Section title="Import from a CSV file">
          <Surface>
            <ImportWords onChanged={changed} />
          </Surface>
        </Section>
        <Section title="Delete a whole list">
          <Surface>
            <DeleteList onChanged={changed} />
          </Surface>
        </Section>
      </SimpleGrid>
    </Stack>
  );
}
