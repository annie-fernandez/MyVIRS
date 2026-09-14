export type ReadingLevel =
  | "beginner"
  | "intermediate"
  | "upper-intermediate"
  | "advanced"
  | "college"
  | "too-short"
  | "needs-more-sentences";

export const READING_LEVEL_LABELS: Record<ReadingLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  "upper-intermediate": "Upper Intermediate",
  advanced: "Advanced",
  college: "College",
  "too-short": "Not applicable for texts under 100 words",
  "needs-more-sentences": "Impossible to comprehend (more sentences needed)",
};

/** Maps a Flesch reading-ease score to the audience it suits. */
export function readingLevel(score: number, wordCount: number): ReadingLevel {
  if (score === 0) return wordCount < 100 ? "too-short" : "needs-more-sentences";
  if (score < 30) return "college";
  if (score < 60) return "advanced";
  if (score < 70) return "upper-intermediate";
  if (score < 80) return "intermediate";
  return "beginner";
}
