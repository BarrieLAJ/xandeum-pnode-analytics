import { desc, eq, gte, and } from "drizzle-orm";
import { getDb } from "./client";
import { networkSnapshots, podSnapshots, podStatsSamples } from "./schema";

export type HistoryRange = "24h" | "7d" | "30d";

function rangeToSince(range: HistoryRange): Date {
  const now = Date.now();
  switch (range) {
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }
}

export async function insertNetworkSnapshot(row: typeof networkSnapshots.$inferInsert) {
  const db = getDb();
  await db.insert(networkSnapshots).values(row);
}

export async function insertPodSnapshots(rows: Array<typeof podSnapshots.$inferInsert>) {
  const db = getDb();
  if (rows.length === 0) return;
  await db.insert(podSnapshots).values(rows);
}

export async function insertPodStatsSample(row: typeof podStatsSamples.$inferInsert) {
  const db = getDb();
  await db.insert(podStatsSamples).values(row);
}

export async function getNetworkHistory(range: HistoryRange) {
  const db = getDb();
  const since = rangeToSince(range);
  return db
    .select()
    .from(networkSnapshots)
    .where(gte(networkSnapshots.ts, since))
    .orderBy(desc(networkSnapshots.ts));
}

export async function getPodHistory(pubkey: string, range: HistoryRange) {
  const db = getDb();
  const since = rangeToSince(range);
  return db
    .select()
    .from(podSnapshots)
    .where(and(eq(podSnapshots.pubkey, pubkey), gte(podSnapshots.ts, since)))
    .orderBy(desc(podSnapshots.ts));
}

export async function getPodStatsHistory(pubkey: string, range: HistoryRange) {
  const db = getDb();
  const since = rangeToSince(range);
  return db
    .select()
    .from(podStatsSamples)
    .where(and(eq(podStatsSamples.pubkey, pubkey), gte(podStatsSamples.ts, since)))
    .orderBy(desc(podStatsSamples.ts));
}


