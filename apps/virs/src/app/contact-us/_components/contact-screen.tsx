"use client";

import { Alert, Button, Group, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconSend, IconX } from "@tabler/icons-react";
import type { ContactInput } from "@repo/core";
import { useMutation } from "@tanstack/react-query";
import { Marker } from "@/components/ui/marker";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api-client/api-fetch";
import { errorMessage } from "@/lib/api-client/error-message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The contact form: emails the VIRS team. */
export function ContactScreen() {
  const form = useForm<ContactInput>({
    mode: "uncontrolled",
    initialValues: { firstName: "", lastName: "", email: "", phone: "", message: "", website: "" },
    validate: {
      firstName: (value) => (value.trim() ? null : "Enter your first name."),
      lastName: (value) => (value.trim() ? null : "Enter your last name."),
      email: (value) => (EMAIL.test(value.trim()) ? null : "Enter a full email address, like ana@example.com."),
      message: (value) => (value.trim() ? (value.length > 5_000 ? "Keep your message under 5,000 characters." : null) : "Write a message."),
    },
  });

  const send = useMutation({
    mutationFn: (values: ContactInput) => apiFetch<void>("/api/contact", { method: "POST", json: { ...values, phone: values.phone || undefined } }),
    onSuccess: () => form.reset(),
  });

  return (
    <Stack gap="xl">
      <PageHeader
        title={
          <>
            Contact <Marker>us</Marker>
          </>
        }
        description="Questions, feedback or research inquiries: send us a message and we'll get back to you by email."
      />

      <Surface>
        <form onSubmit={form.onSubmit((values) => send.mutate(values))}>
          <Stack gap="md">
            {send.isSuccess && (
              <Alert color="virsGreen" icon={<IconCheck size={18} />} title="Message sent">
                Thanks for reaching out. We'll reply to the email address you gave.
              </Alert>
            )}
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
              <TextInput label="First name" autoComplete="given-name" key={form.key("firstName")} {...form.getInputProps("firstName")} />
              <TextInput label="Last name" autoComplete="family-name" key={form.key("lastName")} {...form.getInputProps("lastName")} />
              <TextInput label="Email" type="email" autoComplete="email" key={form.key("email")} {...form.getInputProps("email")} />
              <TextInput label="Phone" description="Optional." type="tel" autoComplete="tel" key={form.key("phone")} {...form.getInputProps("phone")} />
            </SimpleGrid>
            <Textarea label="Message" autosize minRows={5} maxRows={14} key={form.key("message")} {...form.getInputProps("message")} />
            {/* Honeypot, hidden from people and assistive technology; bots fill it in. */}
            <TextInput aria-hidden tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -10000 }} key={form.key("website")} {...form.getInputProps("website")} />
            {send.isError && (
              <Alert color="red" icon={<IconX size={18} />} title="We couldn't send your message">
                {errorMessage(send.error)}
              </Alert>
            )}
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                We only use your details to answer you.
              </Text>
              <Button type="submit" loading={send.isPending} leftSection={<IconSend size={16} />}>
                Send message
              </Button>
            </Group>
          </Stack>
        </form>
      </Surface>
    </Stack>
  );
}
