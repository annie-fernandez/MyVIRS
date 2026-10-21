import { Anchor, List, ListItem, Text } from "@mantine/core";

/** A bulleted list of credits, each with an optional link. */
export function Entries({ items }: { items: { text: string; href?: string; link?: string }[] }) {
  return (
    <List spacing="sm" size="sm" listStyleType="disc">
      {items.map((item) => (
        <ListItem key={item.text}>
          <Text size="sm" span>
            {item.text}{" "}
            {item.href && (
              <Anchor href={item.href} target="_blank" rel="noreferrer" inherit underline="always">
                {item.link}
              </Anchor>
            )}
          </Text>
        </ListItem>
      ))}
    </List>
  );
}
