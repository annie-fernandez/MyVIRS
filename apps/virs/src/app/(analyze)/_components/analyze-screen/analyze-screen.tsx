"use client";

import { ActionIcon, Alert, Box, Button, Group, Progress, Stack, Tabs, Text, Textarea, ThemeIcon, Tooltip } from "@mantine/core";
import { Dropzone, type FileRejection } from "@mantine/dropzone";
import { useSessionStorage } from "@mantine/hooks";
import { IconChartBar, IconFile, IconHighlight, IconInfoCircle, IconUpload, IconX } from "@tabler/icons-react";
import { ANALYZABLE_FILE_KINDS, MAX_TEXT_LENGTH, type AnalysisResult, type AnalyzableFileKind } from "@repo/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { analysisStore } from "@/lib/analysis-store/analysis-store";
import type { StoredAnalysis } from "@/lib/analysis-store/stored-analysis";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";
import { queryKeys } from "@/lib/query-keys";
import { TEXT_SOURCES } from "@/lib/sources";
import { RESULT_PATH, type ResultView } from "../../_lib/result-path";
import classes from "./analyze-screen.module.css";
import { countWords } from "./count-words";
import { formatBytes } from "./format-bytes";
import { readPhoto } from "./read-photo";

export type SourceKey = keyof typeof TEXT_SOURCES;

/** Readability scores need at least this many words (see readingLevel in @repo/core). */
const MIN_WORDS_FOR_SCORE = 100;

/** Height of the text box and of the upload area, so every tab's panel is the same size. */
const INPUT_AREA_HEIGHT = 200;

const FILE_KIND: Record<Exclude<SourceKey, "text">, AnalyzableFileKind> = { doc: "document", pdf: "pdf", image: "image" };

// The title is the same on all four tabs, so only the description and the panel change when you
// switch; the highlighter under "text" takes the tab's color.
const DESCRIPTION: Record<SourceKey, ReactNode> = {
  text: (
    <>
      Paste a passage, then choose <b>Enhanced text</b> to see each word color-coded, or <b>Statistics</b> for its
      readability score.
    </>
  ),
  doc: "Upload a .doc or .docx file and VIRS reads the text inside it.",
  pdf: "Upload a PDF with selectable text. For a scanned PDF, upload photos of its pages instead.",
  image: "Upload a clear photo or screenshot of a page. VIRS reads the text in your browser; the photo isn't uploaded.",
};

/** The Text tab's passage is kept in this browser tab's session storage, so it's still there after leaving the screen. */
const DRAFT_KEY = "virs:analyze-draft";

/** The four ways to add text, as one screen with a tab for each. */
export function AnalyzeScreen({ source }: { source: SourceKey }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meta = TEXT_SOURCES[source];

  // Stored as the plain string (Mantine would JSON-encode it), so drafts saved before this hook still load.
  const [text, setText] = useSessionStorage({ key: DRAFT_KEY, defaultValue: "", serialize: (value) => value, deserialize: (value) => value ?? "" });
  const [file, setFile] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);

  const words = countWords(text);
  const nearLimit = text.length > MAX_TEXT_LENGTH * 0.9;
  const ready = source === "text" ? words > 0 : file !== null;
  const tooShortForScore = source === "text" && words > 0 && words < MIN_WORDS_FOR_SCORE;

  // The view to open afterwards is the mutation's variable, so each button knows whether it started it.
  const analyze = useMutation({
    mutationFn: async (_view: ResultView): Promise<StoredAnalysis> => {
      // The routes also return the id the analysis was saved under, for a signed-in user.
      let response: AnalysisResult & { historyId: string | null };
      let label: string;
      if (source === "text") {
        response = await apiFetch("/api/analyze/text", { method: "POST", json: { text } });
        label = "Pasted text";
      } else if (source === "image") {
        setOcrProgress(0);
        const extracted = await readPhoto(file!, setOcrProgress);
        setOcrProgress(null);
        if (!extracted) throw new Error("We couldn't find any text in this photo. Try a sharper, well-lit photo of the page.");
        if (extracted.length > MAX_TEXT_LENGTH) throw new Error("This photo has more text than VIRS can analyze at once. Try a photo of part of the page.");
        response = await apiFetch("/api/analyze/text", { method: "POST", json: { text: extracted, sourceKind: "image" } });
        label = file!.name;
      } else {
        const form = new FormData();
        form.set("file", file!);
        form.set("kind", FILE_KIND[source]);
        response = await apiFetch("/api/analyze/file", { method: "POST", body: form });
        label = file!.name;
      }
      const { historyId, ...result } = response;
      return { result, source: label, analyzedAt: new Date().toISOString(), historyId };
    },
    onSuccess: (analysis, view) => {
      // Saved to the signed-in user's history: History's cached lists and charts are out of date.
      if (analysis.historyId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.history });
        void queryClient.invalidateQueries({ queryKey: queryKeys.progress });
      }
      analysisStore.set(analysis);
      router.push(RESULT_PATH[view]);
    },
    onError: () => setOcrProgress(null),
  });
  // Stays set after success, so the button keeps its spinner until the results screen shows.
  const running = analyze.isPending || analyze.isSuccess ? analyze.variables : null;

  function onReject(rejections: FileRejection[]) {
    const code = rejections[0]?.errors[0]?.code;
    const kind = ANALYZABLE_FILE_KINDS[FILE_KIND[source as Exclude<SourceKey, "text">]];
    setRejection(
      code === "file-too-large"
        ? `This file is larger than ${formatBytes(kind.maxBytes)}. Try a smaller file.`
        : `This isn't a ${kind.extensions.join(" or ")} file. Choose a different file.`,
    );
  }

  function switchSource(next: string | null) {
    if (next && next !== source) router.push(TEXT_SOURCES[next as SourceKey].href as Route);
  }

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Analyze your <Marker color={meta.color}>text</Marker>
          </>
        }
        description={DESCRIPTION[source]}
      />

      <Surface p={{ base: "md", sm: "lg" }}>
        {/* The four ways to add text are one screen; these tabs switch between them. */}
        <Tabs value={source} onChange={switchSource} mb="md">
          <Tabs.List grow style={{ flexWrap: "nowrap" }} aria-label="Where your text comes from">
            {(Object.keys(TEXT_SOURCES) as SourceKey[]).map((key) => {
              const { icon: SourceIcon, short } = TEXT_SOURCES[key];
              return (
                <Tabs.Tab key={key} value={key} px={{ base: 4, sm: "md" }} disabled={running !== null} className={classes.tab}>
                  <Group gap={8} justify="center" wrap="nowrap">
                    <Box component="span" visibleFrom="sm" lh={0}>
                      <SourceIcon size={18} stroke={1.8} />
                    </Box>
                    {short.title}
                  </Group>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>
        <Stack gap="sm">
          {source === "text" ? (
            <Textarea
              aria-label="Your text"
              placeholder="Paste or type your text here"
              // Same fixed height as the upload area on the other tabs; long text scrolls inside.
              styles={{ input: { height: INPUT_AREA_HEIGHT } }}
              maxLength={MAX_TEXT_LENGTH}
              value={text}
              onChange={(event) => setText(event.currentTarget.value)}
              disabled={running !== null}
            />
          ) : file ? (
            <Group justify="space-between" wrap="nowrap" className={classes.fileRow}>
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon variant="light" color={meta.color} size="lg">
                  <IconFile size={20} />
                </ThemeIcon>
                <div style={{ minWidth: 0 }}>
                  <Text fw={600} truncate>
                    {file.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatBytes(file.size)}
                  </Text>
                </div>
              </Group>
              <Tooltip label="Choose a different file">
                <ActionIcon aria-label="Remove file" onClick={() => setFile(null)} disabled={running !== null}>
                  <IconX size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ) : (
            <Dropzone
              className={classes.dropzone}
              h={INPUT_AREA_HEIGHT}
              onDrop={(files) => {
                setRejection(null);
                analyze.reset();
                setFile(files[0] ?? null);
              }}
              onReject={onReject}
              maxSize={ANALYZABLE_FILE_KINDS[FILE_KIND[source]].maxBytes}
              accept={[...ANALYZABLE_FILE_KINDS[FILE_KIND[source]].mimeTypes]}
              multiple={false}
            >
              <Stack align="center" gap={6} py="lg" style={{ pointerEvents: "none" }}>
                <ThemeIcon size={48} color={meta.color} variant="light">
                  <Dropzone.Reject>
                    <IconX size={24} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconUpload size={24} />
                  </Dropzone.Idle>
                  <Dropzone.Accept>
                    <IconUpload size={24} />
                  </Dropzone.Accept>
                </ThemeIcon>
                <Text fw={600}>Drop a file here, or click to choose one</Text>
                <Text size="sm" c="dimmed">
                  {ANALYZABLE_FILE_KINDS[FILE_KIND[source]].extensions.join(", ")} · up to{" "}
                  {formatBytes(ANALYZABLE_FILE_KINDS[FILE_KIND[source]].maxBytes)}
                </Text>
              </Stack>
            </Dropzone>
          )}

          {rejection && (
            <Alert color="red" icon={<IconX size={18} />} py="xs">
              {rejection}
            </Alert>
          )}

          {ocrProgress !== null && (
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Reading your photo… {Math.round(ocrProgress * 100)}%
              </Text>
              <Progress value={ocrProgress * 100} color={meta.color} animated />
            </Stack>
          )}

          <Group justify="space-between" gap="xs">
            <Text size="sm" c={nearLimit ? "virsOrange.8" : "dimmed"}>
              {source === "text"
                ? `${words.toLocaleString()} ${words === 1 ? "word" : "words"} · ${text.length.toLocaleString()} of ${MAX_TEXT_LENGTH.toLocaleString()} characters`
                : file
                  ? "Ready to analyze."
                  : "Choose a file to start."}
            </Text>
            <Group gap="sm">
              <Button
                variant="default"
                leftSection={<IconChartBar size={16} />}
                disabled={!ready || tooShortForScore || (running !== null && running !== "statistics")}
                loading={running === "statistics"}
                onClick={() => analyze.mutate("statistics")}
              >
                Statistics
              </Button>
              <Button
                leftSection={<IconHighlight size={16} />}
                disabled={!ready || (running !== null && running !== "enhanced")}
                loading={running === "enhanced"}
                onClick={() => analyze.mutate("enhanced")}
              >
                Enhanced text
              </Button>
            </Group>
          </Group>

          {tooShortForScore && (
            <Alert color="virsBlue" icon={<IconInfoCircle size={18} />} py="xs">
              Statistics need at least {MIN_WORDS_FOR_SCORE} words. You can still see the enhanced text.
            </Alert>
          )}

          {analyze.isError && (
            <Alert color="red" icon={<IconX size={18} />} title="We couldn't analyze this">
              {errorMessage(analyze.error)}
            </Alert>
          )}
        </Stack>
      </Surface>
    </Stack>
  );
}
