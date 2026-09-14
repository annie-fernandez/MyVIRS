import type { Grade, WordCategory } from "./categories";

export interface Word {
  id: number;
  value: string;
  category: WordCategory;
  grade: Grade | null;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DictionaryEntry {
  word: string;
  source: "wiktionary";
  /** Sanitized HTML, safe to render. */
  html: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
