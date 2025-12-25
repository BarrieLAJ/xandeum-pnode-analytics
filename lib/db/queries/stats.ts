import { desc, eq, gte, and } from "drizzle-orm";
import { getDb } from "../client";
import { podStatsSamples } from "../schema";
import { HistoryRange, rangeToSince } from "./types";

/**
 * Insert a pod stats sample
 */
export async function insertPodStatsSample(
	row: typeof podStatsSamples.$inferInsert
) {
	await getDb().insert(podStatsSamples).values(row);
}

/**
 * Get pod stats history for a specific pubkey and time range
 */
export async function getPodStatsHistory(pubkey: string, range: HistoryRange) {
	const since = rangeToSince(range);
	return getDb()
		.select()
		.from(podStatsSamples)
		.where(
			and(eq(podStatsSamples.pubkey, pubkey), gte(podStatsSamples.ts, since))
		)
		.orderBy(desc(podStatsSamples.ts));
}

