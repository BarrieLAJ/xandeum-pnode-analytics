import { after, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getSnapshot } from "@/lib/pnodes/service";
import { insertNetworkSnapshot, insertPodSnapshots } from "@/lib/db/queries";
import { serverError } from "@/lib/api/errors";
import { collectStatsFromNodes } from "../../pnodes/_services";

export const dynamic = "force-dynamic";
export const revalidate = 0;
// Give the cron enough time for DB writes (stats run in `after()`).
export const maxDuration = 60;

function authorize(request: Request): boolean {
	const authHeader = request.headers.get("Authorization");
	const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

	return authHeader === expectedAuth;
}

/**
 * GET /api/cron/ingest-snapshot
 *
 * Periodically persists network + per-pod snapshots for historical charts.
 * Protected by `CRON_SECRET` via Authorization header (Bearer token).
 * Vercel automatically includes this header in cron job invocations.
 */
export async function GET(request: Request) {
	try {
		if (!authorize(request)) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (!env.DATABASE_URL) {
			return serverError("DATABASE_URL is not configured");
		}

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

		return NextResponse.json(
			{
				insertedAt: now.toISOString(),
				podsInserted: snapshot.rows.length,
				networkInserted: 1,
				statsCollection: "scheduled",
				source: snapshot.source,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error ingesting snapshot:", error);
		return serverError("Failed to ingest snapshot", error);
	}
}
