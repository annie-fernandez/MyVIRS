import type { Metadata } from "next";
import { DownloadScreen } from "./_components/download-screen";

export const metadata: Metadata = { title: "Download word lists" };

export default function Page() {
  return <DownloadScreen />;
}
