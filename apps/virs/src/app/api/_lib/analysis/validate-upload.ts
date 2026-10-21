import { ANALYZABLE_FILE_KINDS, type AnalyzableFileKind } from "@repo/core";
import { HttpError } from "../http/http-error";
import { unreadableFile } from "./unreadable-file";
import { unsupportedFile } from "./unsupported-file";

/** Checks an upload's extension and size before reading it. */
export function validateUpload(file: File, kind: AnalyzableFileKind): void {
  const rules = ANALYZABLE_FILE_KINDS[kind];
  const name = file.name.toLowerCase();
  if (!rules.extensions.some((extension) => name.endsWith(extension))) {
    throw unsupportedFile(`${rules.label} files must end in ${rules.extensions.join(", ")}.`);
  }
  if (file.size === 0) throw unreadableFile("The file is empty.");
  if (file.size > rules.maxBytes) {
    throw new HttpError(
      413,
      "file_too_large",
      `${rules.label} files can be at most ${Math.round(rules.maxBytes / 1024 / 1024)} MB.`,
    );
  }
}
