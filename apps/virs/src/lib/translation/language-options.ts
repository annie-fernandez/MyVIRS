import { TRANSLATION_LANGUAGES } from "./translation-languages";

/**
 * The language dropdown's choices. A preferred language goes first, in a group of its own, and
 * leaves the full list: Mantine's Select throws if the same value appears twice.
 */
export function languageOptions(preferred: string | null) {
  const pinned = TRANSLATION_LANGUAGES.find((language) => language.value === preferred);
  if (!pinned) return TRANSLATION_LANGUAGES;
  return [
    { group: "Your preferred language", items: [pinned] },
    { group: "All languages", items: TRANSLATION_LANGUAGES.filter((language) => language !== pinned) },
  ];
}
