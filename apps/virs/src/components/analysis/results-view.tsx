"use client";

import { Button, Center, Container, Loader, Stack, Tabs, Text, ThemeIcon, Title } from "@mantine/core";
import { IconChartPie, IconFileText, IconPlus, IconTextScan2 } from "@tabler/icons-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useAnalysis } from "@/lib/analysis-store";
import { EnhancedText } from "./enhanced-text";
import { StatisticsPanel } from "./statistics-panel";

export function ResultsView() {
  const { analysis, hydrated } = useAnalysis();

  if (!hydrated) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (!analysis) {
    return (
      <Container size="sm">
        <Stack align="center" gap="md" py={80} ta="center">
          <ThemeIcon size={64} radius="xl" variant="light">
            <IconTextScan2 size={34} />
          </ThemeIcon>
          <Title order={3}>No results yet</Title>
          <Text c="dimmed">Analyze a text or upload a document to see its enhanced text and statistics here.</Text>
          <Button component={Link} href="/analyze/text" leftSection={<IconPlus size={18} />}>
            Analyze a text
          </Button>
        </Stack>
      </Container>
    );
  }

  const { result, source, analyzedAt } = analysis;

  return (
    <Container size="lg">
      <PageHeader
        title="Results"
        description={`${source} · ${result.statistics.wordCount.total.toLocaleString("en-US")} words · analyzed ${new Date(analyzedAt).toLocaleString()}`}
        actions={
          <Button component={Link} href="/analyze/text" variant="default" leftSection={<IconPlus size={16} />}>
            Analyze another
          </Button>
        }
      />
      <Tabs defaultValue="text" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="text" leftSection={<IconFileText size={16} />}>
            Enhanced text
          </Tabs.Tab>
          <Tabs.Tab value="statistics" leftSection={<IconChartPie size={16} />}>
            Statistics
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="text">
          <EnhancedText result={result} />
        </Tabs.Panel>
        <Tabs.Panel value="statistics">
          <StatisticsPanel result={result} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
