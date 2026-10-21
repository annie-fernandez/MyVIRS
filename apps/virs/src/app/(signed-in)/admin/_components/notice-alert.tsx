import { Alert } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { Notice } from "../_lib/notice";

export function NoticeAlert({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <Alert color={notice.color} icon={notice.color === "red" ? <IconX size={18} /> : <IconCheck size={18} />}>
      {notice.message}
    </Alert>
  );
}
