import { getDb } from "@repo/db";
import { listUserAnalyses } from "@repo/db/queries/history";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import styles from "./history.module.css";

export const dynamic = "force-dynamic";

function formatWhen(value: Date): string {
  return value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function HistoryPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <strong>Vocabulary in Reading Study</strong>
        <a href="/">Back to the site</a>
      </header>
      <main className={styles.main}>
        <h1>History</h1>
        {session ? <HistoryList userId={session.user.id} /> : <SignedOut />}
      </main>
    </div>
  );
}

function SignedOut() {
  return (
    <p>
      Sign in on the site, then open History again. Saved analyses belong to the account that was signed in when the
      passage was analyzed.
    </p>
  );
}

async function HistoryList({ userId }: { userId: string }) {
  const history = await listUserAnalyses(getDb(), userId, 1, 50);
  if (history.items.length === 0) {
    return <p>No saved analyses yet. Analyze a passage while you are signed in, then come back here.</p>;
  }

  return (
    <ul className={styles.list}>
      {history.items.map((item) => (
        <li key={item.id}>
          <a href={`/history/${item.id}`}>
            <strong>{item.title ?? "Untitled analysis"}</strong>
            <div className={styles.meta}>
              {formatWhen(item.createdAt)} · {item.wordCount} words · {item.sourceKind}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
