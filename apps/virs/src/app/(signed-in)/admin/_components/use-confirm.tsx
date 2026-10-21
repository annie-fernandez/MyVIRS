"use client";

import { Alert, Button, Group, Modal, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

interface ConfirmState {
  title: string;
  body: ReactNode;
  action: string;
  run: () => Promise<unknown>;
}

/** One confirm dialog for every destructive admin action; it names what will be lost. */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);
  const dialog = (
    <Modal opened={state !== null} onClose={() => setState(null)} title={state?.title}>
      <Stack gap="md">
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {state?.body}
        </Alert>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setState(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await state?.run();
              setBusy(false);
              setState(null);
            }}
          >
            {state?.action}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
  return { confirm: setState, dialog };
}
