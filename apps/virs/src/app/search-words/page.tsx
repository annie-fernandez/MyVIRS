import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchScreen } from "@/components/words/search-screen";

export const metadata: Metadata = { title: "Search the word lists" };

// SearchScreen keeps its filters in the URL, which needs a Suspense boundary on a static page.
export default function Page() {
  return (
    <Suspense>
      <SearchScreen />
    </Suspense>
  );
}
