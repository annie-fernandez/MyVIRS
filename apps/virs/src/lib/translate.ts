import "server-only";
import type { TranslateInput } from "@repo/core";
import { z } from "zod";
import { HttpError } from "./api/http";
import { translatorEnv } from "./env";

const MICROSOFT_TRANSLATE_URL =
  "https://api.cognitive.microsofttranslator.com/translate";
const languageAliases: Record<string, string> = {
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  iw: "he",
  hmn: "mww",
  tl: "fil",
  no: "nb",
};
const translationResponse = z
  .array(
    z.object({
      detectedLanguage: z.object({ language: z.string() }).optional(),
      translations: z
        .array(z.object({ text: z.string().min(1), to: z.string() }))
        .min(1),
    }),
  )
  .length(1);

export interface Translation {
  translatedText: string;
  sourceLanguage: string | null;
  target: string;
}

export async function translate({
  text,
  target,
}: TranslateInput): Promise<Translation> {
  const config = translatorEnv();
  const providerTarget = languageAliases[target] ?? target;
  const url = new URL(MICROSOFT_TRANSLATE_URL);
  url.search = new URLSearchParams({
    "api-version": "3.0",
    to: providerTarget,
    textType: "plain",
  }).toString();
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
    "Ocp-Apim-Subscription-Key": config.MICROSOFT_TRANSLATOR_KEY,
  });
  if (config.MICROSOFT_TRANSLATOR_REGION) {
    headers.set(
      "Ocp-Apim-Subscription-Region",
      config.MICROSOFT_TRANSLATOR_REGION,
    );
  }

  let response: Response;
  const signal = AbortSignal.timeout(10_000);
  let payload: unknown;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify([{ Text: text }]),
      cache: "no-store",
      signal,
    });
    payload = await response.json().catch((error: unknown) => {
      if (signal.aborted) throw error;
      return null;
    });
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError"))
    ) {
      throw new HttpError(
        504,
        "translation_timeout",
        "Translation took too long. Please try again.",
      );
    }
    throw new HttpError(
      502,
      "translation_unavailable",
      "The translation service is unavailable. Please try again later.",
    );
  }

  if (!response.ok) {
    const providerError = z
      .object({ error: z.object({ code: z.number() }) })
      .safeParse(payload);
    const code = providerError.success
      ? providerError.data.error.code
      : undefined;
    // Never log submitted text, subscription keys, or provider error messages.
    console.warn("[translation] Microsoft Translator rejected a request", {
      status: response.status,
      code,
    });
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const details =
        Number.isSafeInteger(retryAfter) && retryAfter > 0
          ? { retryAfterSeconds: retryAfter }
          : undefined;
      throw new HttpError(
        429,
        "translation_rate_limited",
        "Too many translation requests. Please wait and try again.",
        details,
      );
    }
    if (code === 403001) {
      throw new HttpError(
        503,
        "translation_quota_exceeded",
        "The translation allowance has been used up. Please try again after it resets.",
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(
        503,
        "translation_unavailable",
        "Translation is currently unavailable. Please contact the site administrator.",
      );
    }
    if ([400003, 400019, 400023, 400035, 400036].includes(code ?? 0)) {
      throw new HttpError(
        400,
        "translation_language_unsupported",
        "This language is not supported for translation.",
      );
    }
    throw new HttpError(
      502,
      "translation_unavailable",
      "The translation service is unavailable. Please try again later.",
    );
  }

  const parsed = translationResponse.safeParse(payload);
  const result = parsed.success ? parsed.data[0] : undefined;
  const translated = result?.translations.find(
    (item) => item.to === providerTarget,
  );
  if (!translated) {
    throw new HttpError(
      502,
      "translation_unavailable",
      "The translation service returned an invalid response. Please try again later.",
    );
  }
  return {
    translatedText: translated.text,
    sourceLanguage: result?.detectedLanguage?.language ?? null,
    target,
  };
}
