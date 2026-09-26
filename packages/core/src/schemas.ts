import { z } from "zod";
import { GRADES, WORD_CATEGORIES, parseGrade, parseWordCategory } from "./categories";
import { normalizeWord } from "./word";

export const MAX_TEXT_LENGTH = 30_000;
export const MAX_EXTRACTED_TEXT_LENGTH = 500_000;
export const MAX_TRANSLATE_LENGTH = 5_000;
export const MIN_PASSWORD_LENGTH = 8;

export const USER_LEVELS = ["Student", "Professor", "Parent", "Researcher", "Faculty"] as const;
export type UserLevel = (typeof USER_LEVELS)[number];

export const wordCategorySchema = z
  .string({ error: "Choose a word list" })
  .transform((value, ctx) => {
    const category = parseWordCategory(value);
    if (!category) {
      ctx.addIssue({ code: "custom", message: `Category must be one of: ${WORD_CATEGORIES.join(", ")}` });
      return z.NEVER;
    }
    return category;
  });

export const gradeSchema = z.string({ error: "Choose a grade" }).transform((value, ctx) => {
  const grade = parseGrade(value);
  if (!grade) {
    ctx.addIssue({ code: "custom", message: `Grade must be one of: ${GRADES.join(", ")}` });
    return z.NEVER;
  }
  return grade;
});

export const analyzeTextInput = z.object({
  text: z.string().trim().min(1, "Text is required").max(MAX_TEXT_LENGTH),
});
export type AnalyzeTextInput = z.infer<typeof analyzeTextInput>;

export const ANALYZABLE_FILE_KINDS = {
  pdf: {
    label: "PDF",
    maxBytes: 25 * 1024 * 1024,
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
  },
  document: {
    label: "Word document",
    maxBytes: 25 * 1024 * 1024,
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    extensions: [".doc", ".docx", ".txt"],
  },
  image: {
    label: "Image",
    // AWS Textract's synchronous API rejects documents larger than 10 MB.
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png"],
    extensions: [".jpg", ".jpeg", ".png"],
  },
} as const;
export type AnalyzableFileKind = keyof typeof ANALYZABLE_FILE_KINDS;
export const analyzableFileKindSchema = z.enum(
  Object.keys(ANALYZABLE_FILE_KINDS) as [AnalyzableFileKind, ...AnalyzableFileKind[]],
);

/**
 * Every entry point that can produce a saved analysis: pasted text, plus each uploadable file
 * kind. Derived from ANALYZABLE_FILE_KINDS so adding an upload type cannot leave history behind.
 */
export const ANALYSIS_SOURCE_KINDS = ["text", ...(Object.keys(ANALYZABLE_FILE_KINDS) as AnalyzableFileKind[])] as [
  "text",
  ...AnalyzableFileKind[],
];
export type AnalysisSourceKind = (typeof ANALYSIS_SOURCE_KINDS)[number];
export const analysisSourceKindSchema = z.enum(ANALYSIS_SOURCE_KINDS);

export const sortDirectionSchema = z.enum(["asc", "desc"]);

export const wordSearchQuery = z.object({
  category: wordCategorySchema.default("k1"),
  grade: gradeSchema.optional(),
  q: z.string().trim().max(256).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10_000).default(20),
  sort: sortDirectionSchema.default("asc"),
});
export type WordSearchQuery = z.infer<typeof wordSearchQuery>;

export const wordExportQuery = z.object({
  categories: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(wordCategorySchema).min(1)),
});

export const adminWordInput = z.object({
  // Stored exactly as the analyzer normalizes tokens, otherwise the entry could never match.
  value: z.string().max(256).transform(normalizeWord).pipe(z.string().min(1, "Word is required")),
  category: wordCategorySchema,
  grade: gradeSchema.nullish(),
});
export type AdminWordInput = z.infer<typeof adminWordInput>;

export const adminWordImportInput = z.object({
  category: wordCategorySchema.optional(),
  replace: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const translateInput = z.object({
  text: z.string().trim().min(1).max(MAX_TRANSLATE_LENGTH),
  target: z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/, "Invalid language code"),
});
export type TranslateInput = z.infer<typeof translateInput>;

export const contactInput = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1).max(5_000),
  /** Honeypot: real users never fill this in; the API silently drops submissions that do. */
  website: z.string().max(500).optional(),
});
export type ContactInput = z.infer<typeof contactInput>;

export const forgotPasswordInput = z.object({
  identifier: z.string().trim().min(1, "Enter your username or email").max(256),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;
