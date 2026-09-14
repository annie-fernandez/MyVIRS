import { Badge, Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { CATEGORY_INFO, WORD_CATEGORIES, type WordCategory } from "@repo/core";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { CATEGORY_COLORS } from "@/lib/categories-ui";

export const metadata: Metadata = { title: "Download word lists" };

const GROUPS: { title: string; description: string; categories: WordCategory[] }[] = [
  { title: "K1–K3", description: "The 3,000 most frequent words in primary and secondary texts.", categories: ["k1", "k2", "k3"] },
  { title: "Academic vocabulary", description: "STEM, academic and basic academic words.", categories: ["stem", "awl", "baw"] },
  { title: "Everything", description: "Every word in every list.", categories: [...WORD_CATEGORIES] },
];

function exportHref(categories: WordCategory[]) {
  return `/api/words/export?categories=${categories.join(",")}`;
}

export default function DownloadPage() {
  return (
    <Container size="lg">
      <PageHeader
        title="Download word lists"
        description="Download any list as a CSV file with the word, its list and grade. Opens in Excel, Numbers or Google Sheets."
        icon={<IconDownload size={24} />}
      />
      <Stack gap="xl">
        <div>
          <Title order={4} mb="sm">
            Groups of lists
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            {GROUPS.map((group) => (
              <Card key={group.title} withBorder padding="lg">
                <Text fw={600}>{group.title}</Text>
                <Text size="sm" c="dimmed" mb="md">
                  {group.description}
                </Text>
                <Group gap={4} mb="md">
                  {group.categories.map((category) => (
                    <Badge key={category} size="sm" variant="light" color={CATEGORY_COLORS[category]}>
                      {CATEGORY_INFO[category].label}
                    </Badge>
                  ))}
                </Group>
                <Button component="a" href={exportHref(group.categories)} mt="auto" leftSection={<IconDownload size={16} />}>
                  Download CSV
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        </div>

        <div>
          <Title order={4} mb="sm">
            Individual lists
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {WORD_CATEGORIES.map((category) => (
              <Card key={category} withBorder padding="md">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <div>
                    <Badge color={CATEGORY_COLORS[category]} variant="light" mb={6}>
                      {CATEGORY_INFO[category].label}
                    </Badge>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {CATEGORY_INFO[category].description}
                    </Text>
                  </div>
                  <Button
                    component="a"
                    href={exportHref([category])}
                    variant="light"
                    size="xs"
                    aria-label={`Download ${CATEGORY_INFO[category].label}`}
                  >
                    <IconDownload size={16} />
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </div>
      </Stack>
    </Container>
  );
}
