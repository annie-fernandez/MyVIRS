"use client";

import { Alert, Anchor, Badge, Divider, Group, Modal, ScrollArea, Skeleton, Stack, Text, Typography } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { DictionaryEntry, RatingEvent, RatingValue } from "@repo/core";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShellLink } from "@/components/layout/shell-link";
import { RatingButtons } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { categoryLabel } from "@/lib/categories";
import { CATEGORY_STYLES, RATING_SCALE, type CategoryKey } from "@/theme";

export interface DefinitionTarget {
  word: string;
  category?: CategoryKey;
  /** The saved analysis the word was opened from, so a rating can point back to it. */
  analysisId?: string | null;
  /** The sentence the word was clicked in, saved with a rating. */
  context?: string | null;
}

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; entry: DictionaryEntry };

// Definitions don't change during a visit, so each word is fetched once.
const cache = new Map<string, DictionaryEntry>();

/** A word's Wiktionary definition, opened by clicking a word anywhere in the app. */
export function DefinitionModal({
  target,
  onClose,
  onRated,
}: {
  target: DefinitionTarget | null;
  onClose: () => void;
  /** Lets the screen behind update its own list when a word is rated here. */
  onRated?: (saved: RatingEvent) => void;
}) {
  const word = target?.word.trim() ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!word) return;
    const key = word.toLowerCase();
    const cached = cache.get(key);
    if (cached) {
      setState({ status: "ready", entry: cached });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    apiFetch<DictionaryEntry>(`/api/dictionary/${encodeURIComponent(word)}`)
      .then((entry) => {
        cache.set(key, entry);
        if (!cancelled) setState({ status: "ready", entry });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [word]);

  const category = target?.category;

  return (
    <Modal
      opened={target !== null}
      onClose={onClose}
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group gap="sm">
          <Text fw={600} fz="xl">
            {state.status === "ready" ? state.entry.word : word}
          </Text>
          {category && (
            <Badge styles={{ root: { color: CATEGORY_STYLES[category].text, background: CATEGORY_STYLES[category].tint } }}>
              {categoryLabel(category)}
            </Badge>
          )}
        </Group>
      }
    >
      {/* Rating first: definitions can run long, and the rating is the thing to do here. */}
      {word && <WordRating word={word} analysisId={target?.analysisId ?? null} context={target?.context ?? null} onLeave={onClose} onRated={onRated} />}
      {state.status === "loading" ? (
        <Stack gap="xs" aria-label="Loading the definition">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} />
          <Skeleton height={12} />
          <Skeleton height={12} width="80%" />
        </Stack>
      ) : null}
      {state.status === "loading" ? null : state.status === "error" ? (
        <Alert color="virsOrange" icon={<IconAlertTriangle size={18} />}>
          {state.message}
        </Alert>
      ) : (
        <Stack gap="md">
          <Typography>
            {/* Sanitized on the server with an allowlist (see src/lib/dictionary.ts). */}
            <div dangerouslySetInnerHTML={{ __html: state.entry.html }} />
          </Typography>
          <Text size="xs" c="dimmed">
            Definition from{" "}
            <Anchor href={`https://en.wiktionary.org/wiki/${encodeURIComponent(state.entry.word)}`} target="_blank" rel="noreferrer" inherit>
              Wiktionary
            </Anchor>
            , available under CC BY-SA.
          </Text>
        </Stack>
      )}
    </Modal>
  );
}

const ratingLabel = (value: RatingValue) => RATING_SCALE.find((step) => step.value === value)!.label;
const formatDay = (iso: string) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

/** "How well do you know this word?" Signed-in students rate it; everyone else is told why to log in. */
function WordRating({
  word,
  analysisId,
  context,
  onLeave,
  onRated,
}: {
  word: string;
  analysisId: string | null;
  context: string | null;
  onLeave: () => void;
  onRated?: (saved: RatingEvent) => void;
}) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const [history, setHistory] = useState<RatingEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signedIn = Boolean(session);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    setHistory(null);
    setError(null);
    apiFetch<RatingEvent[]>(`/api/ratings/${encodeURIComponent(word)}`)
      .then((rows) => !cancelled && setHistory(rows))
      .catch((caught: unknown) => !cancelled && setError(errorMessage(caught)));
    return () => {
      cancelled = true;
    };
  }, [word, signedIn]);

  // Shown at once and saved in the background; taken back if the save fails.
  async function rate(rating: RatingValue) {
    setError(null);
    const pending: RatingEvent = { word, rating, context, createdAt: new Date().toISOString() };
    setHistory((rows) => [pending, ...(rows ?? [])]);
    try {
      const saved = await apiFetch<RatingEvent>("/api/ratings", { method: "POST", json: { word, rating, analysisId, context } });
      onRated?.(saved);
    } catch {
      setHistory((rows) => (rows ?? []).filter((row) => row !== pending));
      setError("We couldn't save that rating, so it's back to what it was. Please try again.");
    }
  }

  if (isPending) return null;

  const current = history?.[0];
  const first = history?.at(-1);
  return (
    <>
      <Stack gap="xs">
        <Text fw={600}>How well do you know this word?</Text>
        {signedIn ? (
          <>
            <RatingButtons value={current?.rating ?? null} onChange={rate} word={word} disabled={history === null} />
            <Text size="sm" c="dimmed">
              {!current
                ? "Pick 1 if you've never seen it, up to 5 if you can use it in a sentence."
                : history!.length === 1
                  ? `${ratingLabel(current.rating)}, rated ${formatDay(current.createdAt)}.`
                  : `${ratingLabel(current.rating)} now. You started at "${ratingLabel(first!.rating)}" on ${formatDay(first!.createdAt)}.`}
            </Text>
          </>
        ) : (
          <Text size="sm" c="dimmed">
            {/* ?login=1 opens the log-in pop-up; close this one first so they don't stack. */}
            <Anchor component={ShellLink} href={`${pathname}?login=1` as Route} onClick={onLeave} inherit fw={600}>
              Log in
            </Anchor>{" "}
            to rate words and see your progress over time.
          </Text>
        )}
        {error && (
          <Alert color="red" icon={<IconAlertTriangle size={18} />} py="xs">
            {error}
          </Alert>
        )}
      </Stack>
      <Divider my="md" />
    </>
  );
}
