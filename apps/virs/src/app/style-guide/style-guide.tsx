"use client";

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Code,
  FileInput,
  Group,
  Loader,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconAlertTriangle, IconChartBar, IconCheck, IconHighlight, IconHistory, IconInfoCircle, IconUpload, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {
  CategoryLegend,
  EmptyState,
  Marker,
  OptionCard,
  Pager,
  PageHeader,
  RatingButtons,
  Section,
  Surface,
  WordTag,
} from "@/components/ui";
import { TEXT_SOURCES } from "@/lib/sources";
import { RATING_SCALE, VIRS_COLORS, VIRS_TOKENS, type CategoryKey, type RatingValue, type VirsColor } from "@/theme";

const PALETTE_USE: Record<VirsColor, string> = {
  virsIndigo: "Header, primary actions, links, current page, the Text source",
  virsCyan: "Word documents",
  virsGreen: "PDFs, success",
  virsPink: "Photos",
  virsOrange: "Warnings, the loader, rating 2",
  virsBlue: "Information",
  virsGold: "Middle of the rating scale",
  charcoal: "Text, neutral buttons",
};

const SAMPLE: { word: string; category?: CategoryKey }[] = [
  { word: "Plants", category: "k1" },
  { word: "use" },
  { word: "sunlight", category: "k2" },
  { word: "to" },
  { word: "produce", category: "k1" },
  { word: "glucose", category: "stem" },
  { word: "through" },
  { word: "a" },
  { word: "process", category: "awl" },
  { word: "called" },
  { word: "photosynthesis.", category: "stem" },
];

const TABLE_ROWS: { word: string; category: CategoryKey; label: string; grade: string }[] = [
  { word: "about", category: "k1", label: "K1", grade: "Kindergarten" },
  { word: "process", category: "awl", label: "Academic", grade: "Grade 6" },
  { word: "glucose", category: "stem", label: "STEM", grade: "Grade 8" },
];

const ALL_CATEGORIES: CategoryKey[] = ["k1", "k2", "k3", "awl", "baw", "stem", "hi", "med", "low", "offList"];

/** Every token and shared component, rendered. Keep it in step with src/theme.ts and DESIGN.md. */
export function StyleGuide() {
  const [rating, setRating] = useState<RatingValue | null>(3);

  return (
    <Stack gap={40}>
      <PageHeader
        eyebrow="Design system"
        title={
          <>
            VIRS <Marker>style</Marker> guide
          </>
        }
        description={
          <>
            Every token and shared component, as screens should use them. The rules are in{" "}
            <Code>apps/virs/DESIGN.md</Code>; the values live in <Code>src/theme.ts</Code>.
          </>
        }
      />

      <Section title="Colors" description="Shade 6 is the original site's color. Use these names, never raw hex in screens.">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {(Object.keys(VIRS_COLORS) as VirsColor[]).map((name) => (
            <Surface key={name} p={0} style={{ overflow: "hidden" }}>
              <Group gap={0} wrap="nowrap">
                {VIRS_COLORS[name].map((shade, i) => (
                  <div key={i} style={{ flex: 1, height: 36, background: shade }} />
                ))}
              </Group>
              <Stack gap={0} p="sm">
                <Text fw={600} size="sm">
                  {name}
                </Text>
                <Text size="xs" c="dimmed">
                  {PALETTE_USE[name]}
                </Text>
              </Stack>
            </Surface>
          ))}
        </SimpleGrid>
        <Group gap="lg">
          {(["page", "surface", "border", "text", "textMuted", "header", "frameActive"] as const).map((token) => (
            <Group key={token} gap={8}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: VIRS_TOKENS[token], border: `1px solid ${VIRS_TOKENS.border}` }} />
              <Code>{token}</Code>
            </Group>
          ))}
        </Group>
      </Section>

      <Section title="Type" description="Lexend for everything; Europa only for the site name in the header.">
        <Surface>
          <Stack gap="xs">
            <Title order={1}>Page title (h1)</Title>
            <Title order={2}>Section title (h2)</Title>
            <Title order={3}>Card title (h3)</Title>
            <Text fz="lg">Lead text, under a page title.</Text>
            <Text>Body text: 16 px with a comfortable line height, for reading passages.</Text>
            <Text size="sm" c="dimmed">
              Secondary text: counts, captions, help.
            </Text>
          </Stack>
        </Surface>
      </Section>

      <Section title="Page header" description="The top of every screen. One highlighted word in the title, at most.">
        <Surface>
          <PageHeader
            eyebrow="Analyzing one word at a time"
            title={
              <>
                What would you like to <Marker>read</Marker> today?
              </>
            }
            description="One or two sentences on what the screen does."
            actions={<Button leftSection={<IconChartBar size={18} />}>Main action</Button>}
          />
        </Surface>
      </Section>

      <Section title="Buttons" description="One filled button per area. Other actions are default (outlined) or subtle.">
        <Group>
          <Button leftSection={<IconHighlight size={16} />}>Primary</Button>
          <Button variant="default">Secondary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="light" color="virsOrange">
            Light accent
          </Button>
          <Button variant="light" color="red" leftSection={<IconX size={16} />}>
            Destructive
          </Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Group>
      </Section>

      <Section title="Pager" description="Under a paged list, on the right, with what's shown on the left. Not numbered buttons: they look like the 1–5 rating squares.">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            19 words
          </Text>
          <Pager page={1} total={3} onChange={() => {}} />
        </Group>
      </Section>

      <Section title="Option cards" description="Choices that take you somewhere. White and quiet, with the color on the icon only, so they never compete with the screen's main action. Compact when three or more sit in a row.">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {[TEXT_SOURCES.text, TEXT_SOURCES.doc].map((source) => (
            <OptionCard key={source.href} href={source.href} color={source.color} icon={source.icon} title={source.title} description={source.description} />
          ))}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {[TEXT_SOURCES.doc, TEXT_SOURCES.pdf, TEXT_SOURCES.image].map((source) => (
            <OptionCard key={source.href} compact href={source.href} color={source.color} icon={source.icon} title={source.short.title} description={source.short.description} />
          ))}
        </SimpleGrid>
      </Section>

      <Section title="Panels" description="Every panel is a white surface, the screen's main one included. A screen shows its color in the title's highlighter stroke, not in the panel.">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Surface>
            <Text fw={600} mb="xs">
              Main panel
            </Text>
            <Textarea placeholder="The main input of a screen goes here" minRows={3} autosize />
          </Surface>
          <Surface>
            <Text fw={600} mb={4}>
              Surface
            </Text>
            <Text size="sm" c="dimmed">
              Supporting content: summaries, settings, lists.
            </Text>
          </Surface>
        </SimpleGrid>
      </Section>

      <Section title="Form fields" description="Label above, help or error below, written out in words.">
        <Surface>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput label="User name" placeholder="e.g. ana" />
            <TextInput label="Email" defaultValue="ana@" error="Enter a full email address, like ana@example.com." />
            <Select label="Grade" data={["Kindergarten", "Grade 1", "Grade 2"]} defaultValue="Grade 1" />
            <FileInput label="Word document" placeholder="Choose a .doc or .docx file" leftSection={<IconUpload size={16} />} description="Up to 25 MB." />
            <SegmentedControl data={["All words", "Not rated", "Rated"]} />
            <Group>
              <Checkbox label="Include names" defaultChecked />
              <Switch label="Show categories" defaultChecked />
            </Group>
          </SimpleGrid>
        </Surface>
      </Section>

      <Section title="Words and categories" description="Results mark each word in its category color, with a legend nearby.">
        <Surface>
          <Text fz="lg" lh={2.1}>
            {SAMPLE.map((part, i) => (
              <span key={i}>
                {part.category ? <WordTag category={part.category}>{part.word}</WordTag> : part.word}{" "}
              </span>
            ))}
          </Text>
          <Stack mt="md" pt="md" style={{ borderTop: `1px solid ${VIRS_TOKENS.border}` }}>
            <CategoryLegend categories={ALL_CATEGORIES} />
          </Stack>
        </Surface>
      </Section>

      <Section title="Rating a word" description="Five steps, stored as 1–5. The label shows on hover and under the word.">
        <Surface>
          <Group justify="space-between">
            <Text fw={600} fz="lg">
              photosynthesis
            </Text>
            <RatingButtons word="photosynthesis" value={rating} onChange={setRating} />
          </Group>
          <Text size="sm" c="dimmed" mt="xs">
            {rating ? RATING_SCALE[rating - 1]?.label : "Not rated yet"}
          </Text>
        </Surface>
      </Section>

      <Section title="Messages" description="Say what happened and what to do next.">
        <Stack gap="sm">
          <Alert color="virsBlue" icon={<IconInfoCircle size={18} />}>
            Statistics need at least 100 words. You can still see the enhanced text.
          </Alert>
          <Alert color="virsGreen" icon={<IconCheck size={18} />}>
            Saved to your history.
          </Alert>
          <Alert color="virsOrange" icon={<IconAlertTriangle size={18} />}>
            This PDF has no selectable text. Upload its pages as photos instead.
          </Alert>
          <Alert color="red" icon={<IconX size={18} />} title="We couldn't analyze this file">
            It is larger than 25 MB. Try a smaller file.
          </Alert>
        </Stack>
      </Section>

      <Section title="Badges" description="Short labels on data. Never used as buttons.">
        <Group>
          <Badge>K1</Badge>
          <Badge color="virsOrange">12 of 30 rated</Badge>
          <Badge color="virsGreen">Saved</Badge>
          <Badge color="charcoal">Max 30,000 characters</Badge>
        </Group>
      </Section>

      <Section title="Tables" description="Word lists and history: striped, with a hover highlight, on a surface.">
        <Surface p={0} style={{ overflowX: "auto" }}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Word</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Grade</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {TABLE_ROWS.map((row) => (
                <Table.Tr key={row.word}>
                  <Table.Td>{row.word}</Table.Td>
                  <Table.Td>
                    <WordTag category={row.category}>{row.label}</WordTag>
                  </Table.Td>
                  <Table.Td>{row.grade}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Surface>
      </Section>

      <Section title="Empty and loading states" description="Never leave a blank area: say what's missing, or show that it's coming.">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <EmptyState
            icon={IconHistory}
            title="No passages yet"
            description="Passages you analyze while signed in show up here."
            action={<Button variant="default">Analyze a text</Button>}
          />
          <Surface>
            <Group gap="sm" mb="md">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Reading your photo…
              </Text>
            </Group>
            <Stack gap="xs">
              <Skeleton height={14} />
              <Skeleton height={14} width="85%" />
              <Skeleton height={14} width="60%" />
            </Stack>
          </Surface>
        </SimpleGrid>
      </Section>
    </Stack>
  );
}
