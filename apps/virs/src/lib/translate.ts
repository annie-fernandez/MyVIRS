import "server-only";
import type { TranslateInput } from "@repo/core";
import { HttpError } from "./api/http";

// The same public endpoint the legacy Angular app called from the browser. It is unofficial and
// unauthenticated; swap in the Cloud Translation API if quotas or reliability become a problem.
const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

export interface Translation {
  translatedText: string;
  sourceLanguage: string | null;
  target: string;
}

export async function translate({ text, target }: TranslateInput): Promise<Translation> {
  const url = new URL(GOOGLE_TRANSLATE_URL);
  url.search = new URLSearchParams({ client: "gtx", sl: "auto", tl: target, dt: "t" }).toString();

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ q: text }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new HttpError(502, "translation_unavailable", "The translation service is unavailable.");
  }

  const payload = (await response.json()) as [Array<[string, ...unknown[]]> | null, unknown, string | null];
  const translatedText = (payload[0] ?? []).map((segment) => segment[0]).join("");
  return { translatedText, sourceLanguage: payload[2] ?? null, target };
}
