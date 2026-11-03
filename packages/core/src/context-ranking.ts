import { z } from "zod";
import type { Paginated } from "./types";

// Team A's ranked word lists ("contract v1"), computed by their Python pipeline and handed to us as
// JSON files. This mirrors their schema/contract_v1.schema.json (github.com/AlePerez09/capstone2myvirs),
// so a file that doesn't match fails when it's read instead of breaking the screen. Within v1 they may
// add optional fields; unknown fields are dropped here. A renamed or removed field makes it v2.

export const RANKING_BANDS = ["HIGH", "MID", "LOW", "NONE"] as const;
export type RankingBand = (typeof RANKING_BANDS)[number];

// Their JSON uses snake_case; ours is camelCase, so each word is renamed as it's parsed.
const rankedWordFileSchema = z
  .object({
    /** Word family headword, e.g. "cell". */
    headword: z.string().min(1),
    /** Family members found in the text, e.g. ["cell", "cells"]. */
    forms: z.array(z.string()).min(1),
    match_source: z.enum(["family_list", "derived", "lemma", "self"]),
    /** Most common part of speech in the text (spaCy tag). */
    pos: z.string(),
    band: z.enum(RANKING_BANDS),
    frequency_count: z.number().int().nullable(),
    /** "stem": on the VIRS STEM list, math and science not told apart. */
    subject: z.enum(["general", "academic", "math", "science", "math_science", "stem"]),
    grade_level: z.string().regex(/^(K|G([1-9]|1[0-2]))$/).nullable(),
    /** The K1–K3 school frequency tier, when the word has one. Optional in the contract. */
    k_level: z.enum(["K1", "K2", "K3"]).nullable().optional(),
    /** TextRank percentile in the text, 0 to 1. 0 = not a keyword, null = not computed. */
    relevance: z.number().min(0).max(1).nullable(),
    /** 0.5 × frequency band + 0.5 × relevance, 0 to 1. */
    priority: z.number().min(0).max(1),
    /** 1 = teach first. */
    rank: z.number().int().min(1),
    /** Times the family appears in the text. Optional in the contract. */
    count: z.number().int().min(1).optional(),
  })
  .transform((word) => ({
    headword: word.headword,
    forms: word.forms,
    matchSource: word.match_source,
    pos: word.pos,
    band: word.band,
    frequencyCount: word.frequency_count,
    subject: word.subject,
    gradeLevel: word.grade_level,
    kLevel: word.k_level ?? null,
    relevance: word.relevance,
    priority: word.priority,
    rank: word.rank,
    count: word.count ?? null,
  }));
export type RankedWord = z.output<typeof rankedWordFileSchema>;

/** One of Team A's files, as they write it. */
export const contextRankingSchema = z
  .object({
    contract_version: z.literal("1.0"),
    text_id: z.string().min(1),
    corpus_id: z.string().nullable(),
    text_summary: z.object({
      tokens: z.number().int().min(0),
      coverage_high: z.number().min(0).max(1),
      coverage_lsw: z.number().min(0).max(1),
    }),
    words: z.array(rankedWordFileSchema),
  })
  .transform((file) => ({
    textId: file.text_id,
    corpusId: file.corpus_id,
    /** Words counted; the share in the HIGH band; the share in any band. */
    summary: { tokens: file.text_summary.tokens, coverageHigh: file.text_summary.coverage_high, coverageListed: file.text_summary.coverage_lsw },
    words: file.words,
  }));
export type ContextRanking = z.output<typeof contextRankingSchema>;

/** "context": Team A's combined ranking. "frequency": their frequency-only baseline (band, then count). */
export const CONTEXT_ORDERS = ["context", "frequency"] as const;
export type ContextOrder = (typeof CONTEXT_ORDERS)[number];

export const contextListQuery = z.object({
  by: z.enum(CONTEXT_ORDERS).default("context"),
  q: z.string().trim().toLowerCase().max(256).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
export type ContextListQuery = z.infer<typeof contextListQuery>;

/** One ranked list as GET /api/context-lists describes it. */
export interface ContextListSummary {
  id: string;
  title: string;
  /** Where the list came from and anything to keep in mind when reading it. */
  note: string;
  textId: string;
  corpusId: string | null;
  summary: ContextRanking["summary"];
  wordCount: number;
}

/** GET /api/context-lists/:id — the list and one page of its words, in the order asked for. */
export interface ContextListPage {
  list: ContextListSummary;
  words: Paginated<RankedWord>;
}

const MAX_PASSAGE_WORDS = 20_000;

/** POST /api/context-lists/:id/passage — how many times a passage uses each word, lowercase and without punctuation. */
export const contextPassageInput = z.object({
  counts: z
    .record(z.string().min(1).max(256), z.number().int().min(1))
    .refine((counts) => Object.keys(counts).length <= MAX_PASSAGE_WORDS, `A passage can have at most ${MAX_PASSAGE_WORDS.toLocaleString("en-US")} different words.`),
});
export type ContextPassageInput = z.infer<typeof contextPassageInput>;

/** A word family from a ranked list that the passage uses, with its place in the whole list both ways. */
export interface PassageRankedWord {
  headword: string;
  /** The family's forms the passage uses, e.g. ["cells"]. */
  forms: string[];
  /** Times the passage uses them. */
  count: number;
  band: RankingBand;
  /** Rank in the list by context (Team A's) and by frequency alone (their baseline). 1 = teach first. */
  contextRank: number;
  frequencyRank: number;
}

/** POST /api/context-lists/:id/passage — the passage's words looked up in one ranked list. */
export interface ContextPassageMatch {
  list: ContextListSummary;
  /** In the list's context order. */
  words: PassageRankedWord[];
  /** Different words in the passage that the list doesn't have (names, numbers, words the book never uses). */
  unmatched: number;
}
