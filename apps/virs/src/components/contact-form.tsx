"use client";

import { Button, Card, Container, Group, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconMail, IconSend } from "@tabler/icons-react";
import { contactInput, type ContactInput } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api-client";

export function ContactForm() {
  const form = useForm<ContactInput>({
    mode: "uncontrolled",
    initialValues: { firstName: "", lastName: "", email: "", phone: "", message: "", website: "" },
    validate: schemaResolver(contactInput, { sync: true }),
  });

  const mutation = useMutation({
    mutationFn: (values: ContactInput) => apiFetch<void>("/api/contact", { method: "POST", json: values }),
    onSuccess: () => {
      form.reset();
      notifications.show({ color: "teal", title: "Message sent", message: "Thanks for reaching out — we'll get back to you soon." });
    },
    onError: (error) => notifications.show({ color: "red", title: "Could not send your message", message: error.message }),
  });

  return (
    <Container size="sm">
      <PageHeader
        title="Contact us"
        description="Questions, feedback or research inquiries — send us a message."
        icon={<IconMail size={24} />}
      />
      <Card withBorder padding="lg">
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="First name" required key={form.key("firstName")} {...form.getInputProps("firstName")} />
              <TextInput label="Last name" required key={form.key("lastName")} {...form.getInputProps("lastName")} />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Email" type="email" required key={form.key("email")} {...form.getInputProps("email")} />
              <TextInput label="Phone" type="tel" key={form.key("phone")} {...form.getInputProps("phone")} />
            </SimpleGrid>
            <Textarea label="Message" required autosize minRows={5} key={form.key("message")} {...form.getInputProps("message")} />
            {/* Honeypot, hidden from people and assistive tech. */}
            <TextInput
              aria-hidden
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: -10000 }}
              key={form.key("website")}
              {...form.getInputProps("website")}
            />
            <Group justify="flex-end">
              <Button type="submit" loading={mutation.isPending} leftSection={<IconSend size={16} />}>
                Send message
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
