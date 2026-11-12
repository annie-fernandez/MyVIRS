import { TRANSLATION_LANGUAGES } from "./translation-languages";

/** The choices for a student's preferred language: every language except English, the language they're reading. */
export const PREFERRED_LANGUAGES = TRANSLATION_LANGUAGES.filter((language) => language.value !== "en");
