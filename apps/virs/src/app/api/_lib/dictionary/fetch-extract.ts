import "server-only";

const WIKTIONARY_API = "https://en.wiktionary.org/w/api.php";
// Wikimedia's API policy requires an identifying User-Agent.
const USER_AGENT = "VIRS/2.0 (https://myvirs.com; vocabinreading@gmail.com)";
const ONE_DAY_SECONDS = 60 * 60 * 24;

interface WiktionaryResponse {
  query?: {
    pages?: Record<string, { title: string; missing?: string; extract?: string }>;
  };
}

/** One Wiktionary article's HTML extract, cached for a day, or null when there's no such article. */
export async function fetchExtract(title: string): Promise<string | null> {
  const url = new URL(WIKTIONARY_API);
  // Full-article extracts are limited to one title per request.
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "1",
    action: "query",
    prop: "extracts",
    exlimit: "1",
    titles: title,
  }).toString();

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: ONE_DAY_SECONDS },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Wiktionary responded with ${response.status}`);

  const pages = Object.values(((await response.json()) as WiktionaryResponse).query?.pages ?? {});
  const page = pages.find((candidate) => candidate.missing === undefined);
  return page?.extract ?? null;
}
