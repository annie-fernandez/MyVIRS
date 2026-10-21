import { Text, type TextProps } from "@mantine/core";
import { normalizeWord } from "@repo/core";
import { Fragment } from "react";

/** A sentence with the given word in bold, so students can see how it was used. */
export function WordInContext({ word, context, ...props }: { word: string; context: string | null } & TextProps) {
  if (!context) {
    return (
      <Text size="sm" c="dimmed" {...props}>
        No sentence saved for this word.
      </Text>
    );
  }
  const target = normalizeWord(word);
  return (
    <Text size="sm" c="dimmed" {...props}>
      {context.split(" ").map((token, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          {normalizeWord(token) === target ? (
            <Text span inherit fw={700} c="var(--virs-text)">
              {token}
            </Text>
          ) : (
            token
          )}
        </Fragment>
      ))}
    </Text>
  );
}
