import { contextRankingSchema, type ContextListSummary, type ContextRanking } from "@repo/core";
import { CONTEXT_LISTS } from "./context-lists";

// Parsed once per server instance: the files only change with a deploy.
const cache = new Map<string, Promise<{ list: ContextListSummary; ranking: ContextRanking }>>();

/** A list with its words in Team A's order, checked against their contract; undefined for an unknown id. */
export function loadContextList(id: string) {
  const entry = Object.hasOwn(CONTEXT_LISTS, id) ? CONTEXT_LISTS[id] : undefined;
  if (!entry) return undefined;
  let loaded = cache.get(id);
  if (!loaded) {
    loaded = entry.load().then((file) => {
      const ranking = contextRankingSchema.parse(file);
      const list: ContextListSummary = {
        id,
        title: entry.title,
        note: entry.note,
        textId: ranking.textId,
        corpusId: ranking.corpusId,
        summary: ranking.summary,
        wordCount: ranking.words.length,
      };
      return { list, ranking };
    });
    // A file that fails the contract stays an error until the next deploy, but isn't cached as one.
    loaded.catch(() => cache.delete(id));
    cache.set(id, loaded);
  }
  return loaded;
}
