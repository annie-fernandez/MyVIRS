"use client";

import { Button, SimpleGrid, Stack } from "@mantine/core";
import { IconDatabaseExport } from "@tabler/icons-react";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { AddWord } from "./add-word";
import { DeleteList } from "./delete-list";
import { FindWord } from "./find-word";
import { ImportWords } from "./import-words";

/** Adding, editing, importing and deleting the words VIRS analyzes texts with. Admins only. */
export function AdminScreen() {
  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Manage the word <Marker>lists</Marker>
          </>
        }
        description="Add, edit, import and remove the words VIRS uses to analyze texts. Changes apply to every analysis right away."
        actions={
          <Button component="a" href="/api/admin/words/export" variant="default" leftSection={<IconDatabaseExport size={16} />}>
            Export every word
          </Button>
        }
      />
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md" style={{ alignItems: "start" }}>
        <Section title="Find a word">
          <Surface>
            <FindWord />
          </Surface>
        </Section>
        <Section title="Add a word" description="Adding a word that's already in the list updates its grade.">
          <Surface>
            <AddWord />
          </Surface>
        </Section>
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" style={{ alignItems: "start" }}>
        <Section title="Import from a CSV file">
          <Surface>
            <ImportWords />
          </Surface>
        </Section>
        <Section title="Delete a whole list">
          <Surface>
            <DeleteList />
          </Surface>
        </Section>
      </SimpleGrid>
    </Stack>
  );
}
