import { desc, gte } from "drizzle-orm";
import { getDb } from "../client";
import { networkSnapshots } from "../schema";
import { HistoryRange, rangeToSince } from "./types";

/**
 * Insert a network-level snapshot
 */
export async function insertNetworkSnapshot(
	row: typeof networkSnapshots.$inferInsert
) {
	await getDb().insert(networkSnapshots).values(row);
}

/**
 * Get network history for a given time range
 */
export async function getNetworkHistory(range: HistoryRange) {
	const since = rangeToSince(range);
	return getDb()
		.select()
		.from(networkSnapshots)
		.where(gte(networkSnapshots.ts, since))
		.orderBy(desc(networkSnapshots.ts));
}

