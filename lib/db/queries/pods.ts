import { desc, eq, gte, and } from "drizzle-orm";
import { getDb } from "../client";
import { podSnapshots } from "../schema";
import { HistoryRange, rangeToSince } from "./types";

/**
 * Insert pod snapshots (batch insert)
 */
export async function insertPodSnapshots(
	rows: Array<typeof podSnapshots.$inferInsert>
) {
	if (rows.length === 0) return;
	await getDb().insert(podSnapshots).values(rows);
}

/**
 * Get pod history for a specific pubkey and time range
 */
export async function getPodHistory(pubkey: string, range: HistoryRange) {
	const since = rangeToSince(range);
	return getDb()
		.select()
		.from(podSnapshots)
		.where(and(eq(podSnapshots.pubkey, pubkey), gte(podSnapshots.ts, since)))
		.orderBy(desc(podSnapshots.ts));
}

