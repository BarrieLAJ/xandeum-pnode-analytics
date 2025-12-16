import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getSnapshot } from "@/lib/pnodes/service";
import { insertNetworkSnapshot, insertPodSnapshots } from "@/lib/db/queries";
import { badRequest, forbidden, serverError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function authorize(request: Request): boolean {
  // Support either header or query param for easy cron integrations
  const headerToken = request.headers.get("x-cron-secret") ?? undefined;
  const queryToken = new URL(request.url).searchParams.get("token") ?? undefined;
  const token = headerToken ?? queryToken;

  // If no secret configured, treat as forbidden (safer default)
  if (!env.CRON_SECRET) return false;
  return token === env.CRON_SECRET;
}

/**
 * POST /api/cron/ingest-snapshot
 *
 * Periodically persists network + per-pod snapshots for historical charts.
 * Protected by `CRON_SECRET` (header: x-cron-secret or query: ?token=...).
 */
export async function POST(request: Request) {
  try {
    if (!authorize(request)) {
      return forbidden("UNAUTHORIZED", "Missing or invalid cron token");
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

    return NextResponse.json(
      {
        insertedAt: now.toISOString(),
        podsInserted: snapshot.rows.length,
        networkInserted: 1,
        source: snapshot.source,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error ingesting snapshot:", error);
    return serverError("Failed to ingest snapshot", error);
  }
}

// Disallow other methods
export async function GET() {
  return badRequest("METHOD_NOT_ALLOWED", "Use POST");
}


