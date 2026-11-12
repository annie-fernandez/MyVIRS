"use client";

import { Anchor, Select, type SelectProps } from "@mantine/core";
import { useMemo } from "react";
import { ShellLink } from "@/components/shell-link/shell-link";
import { useSession } from "@/lib/auth/use-session";
import { languageOptions } from "@/lib/translation/language-options";

interface LanguageSelectProps extends Omit<SelectProps, "data" | "value" | "onChange"> {
  value: string;
  onChange: (language: string) => void;
}

/** The language to translate into: the student's preferred language first, then all of them. */
export function LanguageSelect({ value, onChange, ...props }: LanguageSelectProps) {
  const user = useSession();
  const preferred = user?.preferredLanguage ?? null;
  const data = useMemo(() => languageOptions(preferred), [preferred]);
  return (
    <Select
      label="Translate to"
      data={data}
      value={value}
      onChange={(language) => language && onChange(language)}
      searchable
      nothingFoundMessage="No language with that name"
      description={
        user && !preferred ? (
          <Anchor component={ShellLink} href="/account" inherit underline="always">
            Save your preferred language
          </Anchor>
        ) : undefined
      }
      {...props}
    />
  );
}
