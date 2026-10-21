"use client";

import { Button, Select, SimpleGrid, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { adminWordInput, type AdminWordInput, type Grade, type WordCategory } from "@repo/core";
import { useState } from "react";
import { CATEGORY_SELECT_DATA } from "@/lib/categories/category-select-data";
import { GRADE_SELECT_DATA } from "@/lib/categories/grade-select-data";

export interface WordFormValues {
  value: string;
  category: WordCategory | null;
  grade: Grade | null;
}

/** The word, list and grade fields, used to add a word and to edit one. */
export function WordForm({ initialValues, submitLabel, onSubmit }: { initialValues: WordFormValues; submitLabel: string; onSubmit: (input: AdminWordInput, reset: () => void) => Promise<unknown> }) {
  const [saving, setSaving] = useState(false);
  const form = useForm<WordFormValues, AdminWordInput>({
    mode: "uncontrolled",
    initialValues,
    validate: schemaResolver(adminWordInput, { sync: true }),
    transformValues: (values) => adminWordInput.parse(values),
  });
  return (
    <form
      onSubmit={form.onSubmit(async (input) => {
        setSaving(true);
        await onSubmit(input, form.reset);
        setSaving(false);
      })}
    >
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm" style={{ alignItems: "end" }}>
        <TextInput label="Word" placeholder="e.g. photosynthesis" key={form.key("value")} {...form.getInputProps("value")} />
        <Select label="Word list" placeholder="Choose a list" data={CATEGORY_SELECT_DATA} key={form.key("category")} {...form.getInputProps("category")} />
        <Select label="Grade" placeholder="No grade" data={GRADE_SELECT_DATA} clearable allowDeselect key={form.key("grade")} {...form.getInputProps("grade")} />
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </SimpleGrid>
    </form>
  );
}
