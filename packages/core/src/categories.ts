export const WORD_CATEGORIES = [
  "k1",
  "k2",
  "k3",
  "awl",
  "baw",
  "stem",
  "hi",
  "med",
  "low",
] as const;

export type WordCategory = (typeof WORD_CATEGORIES)[number];

export interface CategoryInfo {
  label: string;
  description: string;
  /** Lower wins when a word belongs to several categories. */
  priority: number;
}

export const CATEGORY_INFO: Record<WordCategory, CategoryInfo> = {
  k1: {
    label: "K1",
    description:
      "Among the list of the 1000 most frequently used words in primary and secondary texts",
    priority: 1,
  },
  k2: {
    label: "K2",
    description:
      "Among the list of the 2nd 1000 most frequently used words in primary and secondary texts",
    priority: 2,
  },
  k3: {
    label: "K3",
    description:
      "Among the list of the 3rd 1000 most frequently used words in primary and secondary texts",
    priority: 3,
  },
  awl: {
    label: "Academic",
    description:
      "Commonly occurring among a wide variety of academic subjects but not within the 2000 most frequent words",
    priority: 4,
  },
  stem: {
    label: "STEM",
    description:
      "Words occurring in Math or Science texts but not within the 2000 most frequent words",
    priority: 5,
  },
  hi: {
    label: "Other High Frequency",
    description:
      "Words more than 100 times per 10 million words but not within the 3000 most commonly used words",
    priority: 6,
  },
  med: {
    label: "Medium Frequency",
    description:
      "Moderately occurring words, occurring between 10 to 100 times per 10 million words",
    priority: 7,
  },
  low: {
    label: "Low Frequency",
    description:
      "Rarely occurring words, occurring only 1 to 10 times per 10 million words",
    priority: 9,
  },
  baw: {
    label: "Basic Academic",
    description: "These are academic words that are simpler",
    priority: 10,
  },
};

export const OFF_LIST_INFO = {
  label: "Names & Off-List",
  description: "These are words that are names or are not analyzed by us",
} as const;

export const GRADES = [
  "K",
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
  "G11",
  "G12",
] as const;

export type Grade = (typeof GRADES)[number];

export function gradeLabel(grade: Grade): string {
  return grade === "K" ? "Kindergarten" : `Grade ${grade.slice(1)}`;
}

export function isWordCategory(value: string): value is WordCategory {
  return (WORD_CATEGORIES as readonly string[]).includes(value);
}

/** Accepts legacy spellings such as "K1" or "AWL". */
export function parseWordCategory(value: string): WordCategory | undefined {
  const normalized = value.trim().toLowerCase();
  return isWordCategory(normalized) ? normalized : undefined;
}

export function isGrade(value: string): value is Grade {
  return (GRADES as readonly string[]).includes(value);
}

export function parseGrade(value: string): Grade | undefined {
  const normalized = value.trim().toUpperCase();
  return isGrade(normalized) ? normalized : undefined;
}
