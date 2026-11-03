"use client";

import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { useState } from "react";
import { Pager } from "@/components/ui/pager";
import { Surface } from "@/components/ui/surface";
import type { ComparedWord } from "./compare-ranks";
import { rankShift } from "./rank-shift";

const PAGE_SIZE = 25;

/** Every passage word the book uses, in context order, with its place in both rankings. */
export function WordComparisonTable({ words }: { words: ComparedWord[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(words.length / PAGE_SIZE));
  const rows = words.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Stack gap="sm">
      <Surface p={0} style={{ overflowX: "auto" }}>
        <Table miw={520} layout="fixed">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w="30%">Word</Table.Th>
              <Table.Th w="17%" ta="right">
                By context
              </Table.Th>
              <Table.Th w="17%" ta="right">
                By frequency
              </Table.Th>
              <Table.Th w="36%">Difference</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((word) => {
              const shift = rankShift(word);
              return (
                <Table.Tr key={word.headword}>
                  <Table.Td fw={500} style={{ overflowWrap: "anywhere" }}>
                    {word.headword}
                  </Table.Td>
                  <Table.Td ta="right">#{word.contextPlace.toLocaleString()}</Table.Td>
                  <Table.Td ta="right">#{word.frequencyPlace.toLocaleString()}</Table.Td>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <Box w={10} h={10} bg={shift.color} style={{ borderRadius: 3, flexShrink: 0 }} />
                      <Text size="sm">{shift.text}</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Surface>
      {totalPages > 1 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {words.length.toLocaleString()} words
          </Text>
          <Pager page={page} total={totalPages} onChange={setPage} />
        </Group>
      )}
    </Stack>
  );
}
