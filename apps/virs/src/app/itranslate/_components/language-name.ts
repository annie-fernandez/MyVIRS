import { TRANSLATION_LANGUAGES } from "../_lib/translation-languages";

/** A language's name from its code, e.g. "es" → "Spanish". Falls back to the code itself. */
export function languageName(code: string | null): string {
  return TRANSLATION_LANGUAGES.find((language) => language.value === code)?.label ?? code ?? "";
}
