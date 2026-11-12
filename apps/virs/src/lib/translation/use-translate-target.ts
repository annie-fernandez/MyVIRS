"use client";

import { useLocalStorage } from "@mantine/hooks";
import { useState } from "react";
import { useSession } from "@/lib/auth/use-session";

/** Shown on iTranslate before anyone has picked a language; that screen always needs one selected. */
const FALLBACK_TARGET = "es";

/**
 * The language to translate into. A preferred language from the profile always comes first; picking
 * another lasts until the student leaves the page, and leaves the profile as it is. Without a preferred
 * language, the last one picked is remembered per browser, so nobody picks it again every visit.
 * `chosen` says whether the student has actually told us (a preferred language or a pick), so the word
 * panel can ask instead of assuming the fallback.
 */
export function useTranslateTarget() {
  const preferred = useSession()?.preferredLanguage ?? null;
  const [remembered, setRemembered] = useLocalStorage<string | null>({ key: "virs:translate-target", defaultValue: null });
  const [picked, setPicked] = useState<string | null>(null);
  return {
    target: preferred ? (picked ?? preferred) : (remembered ?? FALLBACK_TARGET),
    setTarget: preferred ? setPicked : setRemembered,
    preferred,
    chosen: Boolean(preferred) || remembered !== null,
  };
}
