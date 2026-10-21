import type { Metadata } from "next";
import { Suspense } from "react";
import { RestoreScreen } from "./_components/restore-screen";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

// RestoreScreen reads the reset token from the URL, which needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <RestoreScreen />
    </Suspense>
  );
}
