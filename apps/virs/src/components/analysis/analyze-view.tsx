"use client";

import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone, type FileRejection } from "@mantine/dropzone";
import {
  IconAlertCircle,
  IconChartPie,
  IconFile,
  IconFileText,
  IconFileTypePdf,
  IconKeyboard,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import {
  ANALYZABLE_FILE_KINDS,
  MAX_TEXT_LENGTH,
  type AnalysisResult,
  type AnalyzableFileKind,
} from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api-client";
import { useAnalysis } from "@/lib/analysis-store";

const ANALYZE_SOURCES = ["text", "document", "pdf", "image"] as const;
type AnalyzeSource = (typeof ANALYZE_SOURCES)[number];

const SOURCE_META: Record<AnalyzeSource, { label: string; title: string; description: string; icon: typeof IconKeyboard }> = {
  text: {
    label: "Text",
    title: "Analyze text",
    description: "Type or paste a text. Readability scores need at least 100 words.",
    icon: IconKeyboard,
  },
  document: {
    label: "Word document",
    title: "Analyze a Word document",
    description: "Upload a .doc, .docx or .txt file of up to 25 MB.",
    icon: IconFileText,
  },
  pdf: {
    label: "PDF",
    title: "Analyze a PDF",
    description: "Upload a PDF of up to 25 MB. Scanned PDFs have no text layer — upload those pages as images.",
    icon: IconFileTypePdf,
  },
  image: {
    label: "Image",
    title: "Analyze an image",
    description: "Upload a clear JPEG or PNG photo or scan of a page, up to 10 MB. The text is extracted with OCR.",
    icon: IconPhoto,
  },
};

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export function AnalyzeView({ source }: { source: AnalyzeSource }) {
  const router = useRouter();
  const { setAnalysis } = useAnalysis();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const meta = SOURCE_META[source];

  const mutation = useMutation({
    mutationFn: async (): Promise<{ result: AnalysisResult; label: string }> => {
      if (source === "text") {
        const result = await apiFetch<AnalysisResult>("/api/analyze/text", { method: "POST", json: { text } });
        return { result, label: "Pasted text" };
      }
      const form = new FormData();
      form.set("file", file!);
      form.set("kind", source satisfies AnalyzableFileKind);
      const result = await apiFetch<AnalysisResult>("/api/analyze/file", { method: "POST", body: form });
      return { result, label: file!.name };
    },
    onSuccess: ({ result, label }) => {
      setAnalysis({ result, source: label, analyzedAt: new Date().toISOString() });
      router.push("/results");
    },
  });

  const canSubmit = source === "text" ? text.trim().length > 0 : file !== null;

  function onReject(rejections: FileRejection[]) {
    const error = rejections[0]?.errors[0];
    setRejection(
      error?.code === "file-too-large"
        ? `The file is too large. The limit is ${formatBytes(ANALYZABLE_FILE_KINDS[source as AnalyzableFileKind].maxBytes)}.`
        : "This file type is not supported here.",
    );
  }

  return (
    <Container size="md">
      <PageHeader title={meta.title} description={meta.description} icon={<meta.icon size={24} />} />

      <Tabs value={source} onChange={(value) => value && router.push(`/analyze/${value}` as Route)} mb="lg">
        <Tabs.List>
          {ANALYZE_SOURCES.map((value) => {
            const Icon = SOURCE_META[value].icon;
            return (
              <Tabs.Tab key={value} value={value} leftSection={<Icon size={16} />}>
                {SOURCE_META[value].label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      <Stack gap="md">
        {mutation.isError && (
          <Alert color="red" icon={<IconAlertCircle size={18} />} title="We couldn't analyze that">
            {mutation.error.message}
          </Alert>
        )}

        {source === "text" ? (
          <Textarea
            aria-label="Text to analyze"
            placeholder="Paste or type your text here…"
            autosize
            minRows={10}
            maxRows={24}
            maxLength={MAX_TEXT_LENGTH}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            description={`${text.length.toLocaleString("en-US")} / ${MAX_TEXT_LENGTH.toLocaleString("en-US")} characters`}
            inputWrapperOrder={["input", "description"]}
          />
        ) : file ? (
          <Paper withBorder p="md">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" size="lg">
                  <IconFile size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} lineClamp={1}>
                    {file.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatBytes(file.size)}
                  </Text>
                </div>
              </Group>
              <ActionIcon variant="subtle" color="gray" aria-label="Remove file" onClick={() => setFile(null)}>
                <IconX size={18} />
              </ActionIcon>
            </Group>
          </Paper>
        ) : (
          <>
            <Dropzone
              onDrop={(files) => {
                setRejection(null);
                setFile(files[0] ?? null);
              }}
              onReject={onReject}
              maxSize={ANALYZABLE_FILE_KINDS[source].maxBytes}
              accept={[...ANALYZABLE_FILE_KINDS[source].mimeTypes]}
              multiple={false}
            >
              <Group justify="center" gap="xl" mih={200} style={{ pointerEvents: "none" }}>
                <Dropzone.Accept>
                  <IconUpload size={48} color="var(--mantine-primary-color-filled)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <meta.icon size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="lg" inline>
                    Drag a file here or click to choose one
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7} display="block">
                    {ANALYZABLE_FILE_KINDS[source].extensions.join(", ")} · up to{" "}
                    {formatBytes(ANALYZABLE_FILE_KINDS[source].maxBytes)}
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {rejection && (
              <Text c="red" size="sm">
                {rejection}
              </Text>
            )}
          </>
        )}

        <Group justify="flex-end">
          <Button
            size="md"
            leftSection={<IconChartPie size={18} />}
            disabled={!canSubmit}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Analyze
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="lg">
          {[
            { step: "1", title: source === "text" ? "Add your text" : "Choose a file", body: meta.description },
            { step: "2", title: "Read the enhanced text", body: "Every word is colored by the frequency list it belongs to. Click a word for its definition." },
            { step: "3", title: "Check the statistics", body: "See the readability score, the level it suits and the word-list breakdown." },
          ].map((item) => (
            <Card key={item.step} withBorder padding="md">
              <ThemeIcon radius="xl" size="md" variant="light" mb="sm">
                <Text size="sm" fw={700}>
                  {item.step}
                </Text>
              </ThemeIcon>
              <Text fw={600} mb={4}>
                {item.title}
              </Text>
              <Text size="sm" c="dimmed">
                {item.body}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
