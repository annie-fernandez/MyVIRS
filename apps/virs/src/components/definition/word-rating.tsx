"use client";

import { Alert, Anchor, Divider, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { RatingButtons } from "@/components/ui/rating-buttons";
import { errorMessage } from "@/lib/api-client/error-message";
import { signInUrl } from "@/lib/auth/sign-in-url";
import { useSession } from "@/lib/auth/use-session";
import { useRateWord } from "@/lib/use-rate-word";
import { formatDay } from "./format-day";
import { ratingLabel } from "./rating-label";
import { wordRatingsQuery } from "./word-ratings-query";

/** "How well do you know this word?" Signed-in students rate it; everyone else is told why to log in. */
export function WordRating({ word, analysisId, context, onLeave }: { word: string; analysisId: string | null; context: string | null; onLeave?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const signedIn = useSession() !== null;
  const ratings = useQuery({ ...wordRatingsQuery(word), enabled: signedIn });
  const rateWord = useRateWord();
  const history = ratings.data;
  const error = rateWord.isError
    ? "We couldn't save that rating, so it's back to what it was. Please try again."
    : ratings.isError
      ? errorMessage(ratings.error)
      : null;

  const current = history?.[0];
  const first = history?.at(-1);
  return (
    <>
      <Stack gap="xs">
        <Text fw={600}>How well do you know this word?</Text>
        {signedIn ? (
          <>
            <RatingButtons value={current?.rating ?? null} onChange={(rating) => rateWord.mutate({ word, rating, analysisId, context })} word={word} disabled={!history} />
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
            {/* The sign-in page brings them back to this screen afterwards. */}
            <Anchor component={Link} href={signInUrl(`${pathname}${searchParams.size ? `?${searchParams}` : ""}`, "Log in to rate words") as Route} onClick={onLeave} inherit fw={600}>
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
