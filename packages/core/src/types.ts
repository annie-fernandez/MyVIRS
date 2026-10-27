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

/** A word that is a form of another, e.g. "cells" (the plural of "cell"). */
export interface FormOf {
  base: string;
  relation: "plural" | "past" | "ing" | "comparative" | "superlative" | "form";
  /** Every sense is this form, so the entry itself says nothing beyond "plural of cell". */
  only: boolean;
}

export interface DictionaryEntry {
  word: string;
  source: "wiktionary";
  /** Sanitized HTML, safe to render. */
  html: string;
  /** How it's said, respelled for a K-12 reader from Wiktionary's American IPA, e.g. FOH-tuh-graf. */
  respelling: string | null;
  /** An American speaker saying it (MP3 on Wikimedia Commons), when there's a recording. */
  audioUrl: string | null;
  /** What it's a form of, when it is one, so the panel can show that word's meaning too. */
  formOf: FormOf | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
