"use client";

import { Button, Group, Select, Stack, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { adminWordInput, GRADES, gradeLabel, type AdminWordInput, type Grade, type WordCategory } from "@repo/core";
import { CATEGORY_SELECT_DATA } from "@/lib/categories-ui";

export interface WordFormValues {
  value: string;
  category: WordCategory | null;
  grade: Grade | null;
}

const GRADE_SELECT_DATA = GRADES.map((grade) => ({ value: grade, label: gradeLabel(grade) }));

export function WordForm({
  initialValues,
  submitLabel,
  loading,
  onSubmit,
  inline = false,
}: {
  initialValues: WordFormValues;
  submitLabel: string;
  loading: boolean;
  onSubmit: (values: AdminWordInput, reset: () => void) => void;
  inline?: boolean;
}) {
  const Fields = inline ? Group : Stack;
  const form = useForm<WordFormValues, AdminWordInput>({
    mode: "uncontrolled",
    initialValues,
    validate: schemaResolver(adminWordInput, { sync: true }),
    transformValues: (values) => adminWordInput.parse(values),
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values, form.reset))}>
      <Fields align={inline ? "flex-start" : "stretch"} gap="sm">
        <TextInput label="Word" placeholder="e.g. photosynthesis" style={inline ? { flex: "1 1 200px" } : undefined} key={form.key("value")} {...form.getInputProps("value")} />
        <Select label="Word list" data={CATEGORY_SELECT_DATA} placeholder="Choose a list" w={inline ? 200 : undefined} key={form.key("category")} {...form.getInputProps("category")} />
        <Select label="Grade" data={GRADE_SELECT_DATA} placeholder="None" clearable w={inline ? 160 : undefined} key={form.key("grade")} {...form.getInputProps("grade")} />
        <Button type="submit" loading={loading} mt={inline ? 25 : "xs"}>
          {submitLabel}
        </Button>
      </Fields>
    </form>
  );
}
