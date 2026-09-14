import type { Metadata } from "next";
import { Suspense } from "react";
import { WordSearch } from "@/components/words/word-search";

export const metadata: Metadata = { title: "Search words" };

export default function WordsPage() {
  return (
    <Suspense>
      <WordSearch />
    </Suspense>
  );
}
