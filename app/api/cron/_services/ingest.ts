import { after } from "next/server";
import { getSnapshot } from "@/lib/pnodes/service";
import { insertNetworkSnapshot, insertPodSnapshots } from "@/lib/db/queries";
import { collectStatsFromNodes } from "../../pnodes/_services";
import type { SnapshotResponse } from "@/lib/pnodes/types";

export interface IngestResult {
	insertedAt: string;
	podsInserted: number;
	networkInserted: number;
	statsCollection: "scheduled";
	source: SnapshotResponse["source"];
}

/**
 * Ingest a snapshot into the database
 * Persists network and pod snapshots, and schedules stats collection
 */
export async function ingestSnapshot(): Promise<IngestResult> {
	const now = new Date();
	const snapshot = await getSnapshot();

	// Network snapshot
	await insertNetworkSnapshot({
		ts: now,
		totalPods: snapshot.stats.totalNodes,
		publicPods: snapshot.stats.publicPods ?? snapshot.stats.nodesWithRpc,
		totalStorageCommittedBytes: snapshot.stats.totalStorageCommittedBytes ?? 0,
		totalStorageUsedBytes: snapshot.stats.totalStorageUsedBytes ?? 0,
		uniqueVersions: snapshot.stats.uniqueVersions,
		modalVersion: snapshot.stats.modalVersion,
		versionDistribution: snapshot.stats.versionDistribution,
	});

	// Per-pod snapshots
	await insertPodSnapshots(
		snapshot.rows.map((row) => ({
			ts: now,
			pubkey: row.pubkey,
			ip: row.derived.ipAddress ?? null,
			address: row.pod?.address ?? null,
			prpcPort: row.pod?.prpcPort ?? null,
			prpcUrl: row.pod?.prpcUrl ?? null,
			isPublic: row.pod?.isPublic ?? false,
			version: row.version ?? null,
			lastSeenTimestamp: row.pod?.lastSeenTimestamp ?? null,
			uptimeSeconds: row.pod?.uptimeSeconds ?? null,
			storageCommittedBytes: row.pod?.storageCommittedBytes ?? null,
			storageUsedBytes: row.pod?.storageUsedBytes ?? null,
			storageUsagePercent: row.pod?.storageUsagePercent ?? null,
		}))
	);

	// Collect stats in the background so the cron route responds quickly.
	// This avoids 503s from long-running external RPC calls.
	after(async () => {
		try {
			const statsResult = await collectStatsFromNodes(snapshot.rows, now);
			console.log(
				`[Cron] Stats collection: ${statsResult.collected} collected, ${statsResult.failed} failed, ${statsResult.skipped} skipped`
			);
		} catch (error) {
			console.error("[Cron] Error collecting stats:", error);
		}
	});

	return {
		insertedAt: now.toISOString(),
		podsInserted: snapshot.rows.length,
		networkInserted: 1,
		statsCollection: "scheduled",
		source: snapshot.source,
	};
}

