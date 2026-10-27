import "server-only";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
// Wikimedia's API policy requires an identifying User-Agent.
const USER_AGENT = "VIRS/2.0 (https://myvirs.com; vocabinreading@gmail.com)";
const ONE_DAY_SECONDS = 60 * 60 * 24;

interface CommonsResponse {
  query?: { pages?: { missing?: boolean; videoinfo?: { url: string; derivatives?: { src: string; type: string }[] }[] }[] };
}

/**
 * An American speaker saying the word, from the recordings Wiktionary uses (Wikimedia Commons,
 * "En-us-<word>.ogg"), as MP3 so Safari can play it too. Null when there's no recording. The name
 * is matched exactly, so "read" never plays a recording of another word.
 */
export async function fetchRecording(word: string): Promise<string | null> {
  const url = new URL(COMMONS_API);
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "2",
    action: "query",
    titles: `File:En-us-${word}.ogg`,
    prop: "videoinfo",
    viprop: "url|derivatives",
  }).toString();

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: ONE_DAY_SECONDS },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Wikimedia Commons responded with ${response.status}`);

  const file = ((await response.json()) as CommonsResponse).query?.pages?.[0];
  const info = file && !file.missing ? file.videoinfo?.[0] : undefined;
  if (!info) return null;
  const mp3 = info.derivatives?.find((derivative) => derivative.type === "audio/mpeg")?.src ?? null;
  // Commons adds tracking parameters to its links; the file is the same without them.
  return mp3 ? mp3.split("?")[0]! : null;
}
