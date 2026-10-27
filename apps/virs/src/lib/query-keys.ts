/** Every TanStack Query key in the app, so a change made on one screen can refresh another's data. */
export const queryKeys = {
  /** The session keep-alive in SessionProvider. */
  session: ["session"] as const,
  /** GET /api/progress */
  progress: ["progress"] as const,
  /** Every GET /api/history page and saved analysis. */
  history: ["history"] as const,
  historyPage: (page: number) => ["history", "page", page] as const,
  savedAnalysis: (id: string) => ["history", "item", id] as const,
  /** GET /api/dictionary/:word */
  dictionary: (word: string) => ["dictionary", word.toLowerCase()] as const,
  /** GET /api/ratings/:word */
  wordRatings: (word: string) => ["ratings", word.toLowerCase()] as const,
  /** Every word list query: the search table and the "is in" lookup. */
  words: ["words"] as const,
  wordList: (params: string) => ["words", "list", params] as const,
  wordLookup: (value: string) => ["words", "lookup", value.toLowerCase()] as const,
  /** GET /api/context-lists and one page of a list (Team A's ranked words). */
  contextLists: ["context-lists"] as const,
  contextList: (id: string, params: string) => ["context-lists", id, params] as const,
  /** GET /api/admin/words?value= */
  adminWords: ["admin-words"] as const,
  adminWord: (value: string) => ["admin-words", value.toLowerCase()] as const,
};
