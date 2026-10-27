"use client";

import { Typography } from "@mantine/core";

/** A Wiktionary definition, already sanitized on the server (see src/app/api/_lib/dictionary/extract-english-definitions.ts). */
export function DefinitionHtml({ html }: { html: string }) {
  return (
    <Typography>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Typography>
  );
}
