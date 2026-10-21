import { translateInput } from "@repo/core";

// Google's free translation endpoint, called from the student's browser. Google answers browsers
// (CORS allows any origin) but has started rejecting requests from servers with HTTP 429, which
// broke /api/translate on Vercel in October 2026. POST keeps long passages and "&" or "#" intact,
// which the old Angular GET request in the URL did not. Unofficial: if Google ever blocks browsers
// too, switch to an official API (Azure Translator or Google Cloud Translation).
const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

export interface Translation {
  translatedText: string;
  sourceLanguage: string | null;
  target: string;
}

export async function translateInBrowser(text: string, target: string): Promise<Translation> {
  const input = translateInput.safeParse({ text, target });
  if (!input.success) throw new Error("Enter some text and choose a language.");

  const url = new URL(GOOGLE_TRANSLATE_URL);
  url.search = new URLSearchParams({ client: "gtx", sl: "auto", tl: input.data.target, dt: "t" }).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({ q: input.data.text }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error("We couldn't reach the translation service. Check your connection and try again.");
  }
  if (response.status === 429) throw new Error("The translation service is busy. Wait a minute and try again.");
  if (!response.ok) throw new Error("The translation service didn't answer. Please try again later.");

  const payload = (await response.json()) as [Array<[string, ...unknown[]]> | null, unknown, string | null];
  const translatedText = (payload[0] ?? []).map((segment) => segment[0]).join("");
  if (!translatedText) throw new Error("The translation came back empty. Try a different language or shorter text.");
  return { translatedText, sourceLanguage: payload[2] ?? null, target: input.data.target };
}
