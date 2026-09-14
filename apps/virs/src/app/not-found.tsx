import { Container, Stack, Text, Title } from "@mantine/core";
import { ButtonLink } from "@/components/link-components";

export default function NotFound() {
  return (
    <Container size="sm">
      <Stack align="center" gap="md" py={80} ta="center">
        <Title order={1} fz={80} c="dimmed">
          404
        </Title>
        <Title order={3}>Page not found</Title>
        <Text c="dimmed">The page you are looking for does not exist or has moved.</Text>
        <ButtonLink href="/">Back to home</ButtonLink>
      </Stack>
    </Container>
  );
}
