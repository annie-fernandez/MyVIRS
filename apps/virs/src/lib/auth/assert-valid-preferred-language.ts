import { APIError } from "better-auth";
import { PREFERRED_LANGUAGES } from "../translation/preferred-languages";

/** Rejects a preferred language that isn't one of PREFERRED_LANGUAGES. Empty means "not set". */
export function assertValidPreferredLanguage(value: unknown) {
  if (value == null || value === "") return;
  if (!PREFERRED_LANGUAGES.some((language) => language.value === value)) {
    throw new APIError("BAD_REQUEST", { message: "preferredLanguage must be one of the languages offered." });
  }
}
