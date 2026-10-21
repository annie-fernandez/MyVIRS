import { Box, Group, Text } from "@mantine/core";
import classes from "./key-item.module.css";

/** One entry in the "Words improved" key: a swatch and its label. */
export function KeyItem({ variant, label }: { variant: "learned" | "partway" | "track"; label: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box className={classes.keySwatch} data-variant={variant} />
      <Text size="xs">{label}</Text>
    </Group>
  );
}
