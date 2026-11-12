"use client";

import { Combobox, Group, ScrollArea, Text, useCombobox } from "@mantine/core";
import { IconCheck, IconSearch } from "@tabler/icons-react";
import { useMemo, useState, type ReactNode } from "react";
import { useSession } from "@/lib/auth/use-session";
import { TRANSLATION_LANGUAGES } from "@/lib/translation/translation-languages";

interface LanguagePickerProps {
  /** The language now in use, ticked in the list; null when none has been chosen yet. */
  value: string | null;
  onChange: (language: string) => void;
  /** The button that opens the list. It's handed the function to call when it's clicked. */
  children: (toggle: () => void) => ReactNode;
}

/**
 * "Translate into": a searchable list of languages that opens right under the button that asked for
 * it, the way reading tools ask for a language (no field on screen until it's needed). The preferred
 * language from My profile comes first.
 */
export function LanguagePicker({ value, onChange, children }: LanguagePickerProps) {
  const preferred = useSession()?.preferredLanguage ?? null;
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    onDropdownOpen: () => combobox.focusSearchInput(),
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setSearch("");
    },
  });

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = TRANSLATION_LANGUAGES.filter((language) => language.label.toLowerCase().includes(query));
    const pinned = matches.filter((language) => language.value === preferred);
    const rest = matches.filter((language) => language.value !== preferred);
    return pinned.length > 0 ? [{ label: "Your preferred language", items: pinned }, { label: "All languages", items: rest }] : [{ label: null, items: rest }];
  }, [search, preferred]);

  const empty = groups.every((group) => group.items.length === 0);

  return (
    <Combobox
      store={combobox}
      width={240}
      position="bottom-start"
      offset={6}
      shadow="md"
      radius="md"
      transitionProps={{ transition: "pop-top-left", duration: 150 }}
      onOptionSubmit={(language) => {
        onChange(language);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target withAriaAttributes={false}>{children(() => combobox.toggleDropdown())}</Combobox.Target>
      {/* Mantine's own padding: the search field spans the full width by reaching into it. */}
      <Combobox.Dropdown>
        <Text size="xs" fw={600} c="dimmed" px={8} pt={6} pb={6}>
          Translate into
        </Text>
        {/* Under the heading rather than at the very top, so it doesn't pull itself up over it. */}
        <Combobox.Search
          mt={0}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search languages"
          aria-label="Search languages"
          leftSection={<IconSearch size={14} />}
        />
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={240}>
            {empty ? (
              <Combobox.Empty>No language with that name</Combobox.Empty>
            ) : (
              groups.map((group) => {
                const options = group.items.map((language) => (
                  <Combobox.Option key={language.value} value={language.value} active={language.value === value}>
                    <Group justify="space-between" gap={8} wrap="nowrap">
                      <Text size="sm" fw={language.value === value ? 600 : undefined} inherit>
                        {language.label}
                      </Text>
                      {language.value === value && <IconCheck size={14} aria-hidden />}
                    </Group>
                  </Combobox.Option>
                ));
                return group.label ? (
                  <Combobox.Group key={group.label} label={group.label}>
                    {options}
                  </Combobox.Group>
                ) : (
                  options
                );
              })
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
