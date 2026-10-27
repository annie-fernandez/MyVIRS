"use client";

import { Group, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconVolume } from "@tabler/icons-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { speakWord } from "./speak-word";
import classes from "./word-pronunciation.module.css";

// Speech synthesis is in every current browser, but a few locked-down ones lack it. Read through
// useSyncExternalStore so the server render (no window) and the first client render agree.
const subscribe = () => () => {};
const canSpeak = () => "speechSynthesis" in window;
const cannotSpeakOnServer = () => false;

type Speed = "normal" | "slow";

/**
 * The speaker, how the word is said (FOH-tuh-graf), and Slower: separate buttons, so clicking the
 * speaker again just says it again. Without a respelling the speaker is labelled "Listen", so the row
 * never looks half empty. Plays an American speaker's recording when Wiktionary has one, slowed without
 * changing the pitch; otherwise the browser's own voice says it.
 */
export function WordPronunciation({ word, respelling, audioUrl }: { word: string; respelling: string | null; audioUrl: string | null }) {
  const canUseVoice = useSyncExternalStore(subscribe, canSpeak, cannotSpeakOnServer);
  const [playing, setPlaying] = useState<Speed | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const canListen = audioUrl !== null || canUseVoice;

  function listen(speed: Speed) {
    const slow = speed === "slow";
    setPlaying(speed);
    const done = () => setPlaying(null);
    if (!audioUrl) {
      speakWord(word, slow, done);
      return;
    }
    if (!audio.current) {
      audio.current = new Audio(audioUrl);
      audio.current.onended = done;
    }
    audio.current.pause();
    audio.current.currentTime = 0;
    audio.current.playbackRate = slow ? 0.6 : 1;
    audio.current.play().catch((error: unknown) => {
      // A click while it's still playing cancels the previous play() (AbortError): not a failure.
      if (error instanceof DOMException && error.name === "AbortError") return;
      // The recording couldn't play (offline, blocked): the browser's voice says it instead.
      if (canUseVoice) speakWord(word, slow, done);
      else done();
    });
  }

  if (!canListen && !respelling) return null;
  return (
    <Group gap="sm" mb="md" wrap="nowrap" align="center">
      {canListen && (
        <Tooltip label="Listen" disabled={!respelling}>
          <UnstyledButton className={classes.listen} data-playing={playing === "normal" || undefined} onClick={() => listen("normal")} aria-label={`Listen to "${word}"`}>
            <IconVolume size={24} stroke={1.8} />
            {!respelling && <span>Listen</span>}
          </UnstyledButton>
        </Tooltip>
      )}
      {respelling && (
        <Text fz="lg" fw={500} style={{ overflowWrap: "anywhere", letterSpacing: "0.02em" }}>
          {respelling}
        </Text>
      )}
      {canListen && (
        <UnstyledButton className={classes.slower} data-playing={playing === "slow" || undefined} onClick={() => listen("slow")} aria-label={`Listen to "${word}" slowly`}>
          Slower
        </UnstyledButton>
      )}
    </Group>
  );
}
