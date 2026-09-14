import {
  Badge,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconFileText,
  IconFileTypePdf,
  IconKeyboard,
  IconListSearch,
  IconPhoto,
} from "@tabler/icons-react";
import type { Route } from "next";
import { ButtonLink, CardLink } from "@/components/link-components";
import { CATEGORY_COLORS, CATEGORY_KEYS, categoryDescription, categoryLabel } from "@/lib/categories-ui";

const SOURCES: { title: string; description: string; href: Route; icon: typeof IconKeyboard; color: string }[] = [
  { title: "Type or paste text", description: "Up to 30,000 characters", href: "/analyze/text", icon: IconKeyboard, color: "indigo" },
  { title: "Word document", description: ".doc, .docx or .txt", href: "/analyze/document", icon: IconFileText, color: "blue" },
  { title: "PDF", description: "PDFs with selectable text", href: "/analyze/pdf", icon: IconFileTypePdf, color: "red" },
  { title: "Image", description: "JPEG or PNG photo of a page", href: "/analyze/image", icon: IconPhoto, color: "teal" },
];

export default function HomePage() {
  return (
    <Container size="lg" py="md">
      <Stack gap={48}>
        <Stack gap="lg" align="flex-start" maw={720}>
          <Badge variant="light" size="lg">
            Analyzing one word at a time
          </Badge>
          <Title order={1} fz={{ base: 34, sm: 48 }} lh={1.1}>
            Know how readable a text is before you read it.
          </Title>
          <Text size="lg" c="dimmed">
            Paste a text or upload a document to get its Flesch readability score, see every word color-coded
            by frequency list (K1–K3, academic, STEM and more) and look up definitions with one click.
          </Text>
          <Group>
            <ButtonLink href="/analyze/text" size="md" rightSection={<IconArrowRight size={18} />}>
              Measure readability
            </ButtonLink>
            <ButtonLink href="/words" size="md" variant="default" leftSection={<IconListSearch size={18} />}>
              Browse word lists
            </ButtonLink>
          </Group>
        </Stack>

        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          {SOURCES.map((source) => (
            <CardLink key={source.href} href={source.href} withBorder padding="lg">
              <ThemeIcon size={48} radius="md" variant="light" color={source.color} mb="md">
                <source.icon size={26} stroke={1.6} />
              </ThemeIcon>
              <Text fw={600}>{source.title}</Text>
              <Text size="sm" c="dimmed">
                {source.description}
              </Text>
            </CardLink>
          ))}
        </SimpleGrid>

        <Stack gap="md">
          <div>
            <Title order={3}>What the colors mean</Title>
            <Text c="dimmed">Every word in your text is matched against these research-based word lists.</Text>
          </div>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {CATEGORY_KEYS.map((key) => (
              <Stack key={key} gap={4} align="flex-start">
                <Badge color={CATEGORY_COLORS[key]} variant="light" tt="none" size="lg">
                  {categoryLabel(key)}
                </Badge>
                <Text size="sm" c="dimmed">
                  {categoryDescription(key)}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Container>
  );
}
