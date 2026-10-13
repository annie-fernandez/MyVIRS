import type { AnalysisResult } from "@repo/core";
import { getDb } from "@repo/db";
import { getUserAnalysis } from "@repo/db/queries/history";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { toLegacyText } from "@/lib/legacy/format";
import styles from "../history.module.css";

export const dynamic = "force-dynamic";

export default async function SavedAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) notFound();

  const row = await getUserAnalysis(getDb(), session.user.id, id);
  if (!row) notFound();

  const saved: AnalysisResult = {
    words: row.wordMatches,
    sentenceCount: row.sentenceCount,
    fleschReadingScore: row.fleschReadingScore,
    statistics: row.statistics,
  };
  const payload = JSON.stringify(JSON.stringify(toLegacyText(saved))).replace(/</g, "\\u003c");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>Opening the saved analysis…</p>
      </main>
      <script
        dangerouslySetInnerHTML={{
          __html: `sessionStorage.setItem("virs-history-result", ${payload}); location.replace("/enhanced-text-result");`,
        }}
      />
    </div>
  );
}
