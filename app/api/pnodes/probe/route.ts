import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/pnodes/service";
import {
	probeNodes,
	enrichWithProbes,
	calculateProbeStats,
} from "../_services/probe";
import { isRpcProbingEnabled } from "@/lib/config/env";
import { forbidden, notFound, serverError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Probing can take a while, increase timeout
export const maxDuration = 60;

/**
 * GET /api/pnodes/probe
 *
 * Probes all pNode RPC endpoints for health and latency.
 * This is an expensive operation - use sparingly.
 *
 * Query parameters:
 * - force: Set to "true" to probe even if probing is disabled in config
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Check if probing is enabled
    if (!isRpcProbingEnabled() && !force) {
      return forbidden(
        "RPC probing is disabled",
        "Set ENABLE_RPC_PROBES=true in environment or use ?force=true"
      );
    }

    const startTime = performance.now();

    // Get current snapshot
    const snapshot = await getSnapshot();

    if (snapshot.rows.length === 0) {
      return notFound("No pNodes available to probe");
    }

    // Probe all nodes
    const probeResults = await probeNodes(snapshot.rows);

    // Enrich rows with probe data
    const enrichedRows = enrichWithProbes(snapshot.rows, probeResults);

    // Calculate statistics
    const probeStats = calculateProbeStats(probeResults);

    const durationMs = performance.now() - startTime;

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        probeDurationMs: Math.round(durationMs),
        stats: probeStats,
        rows: enrichedRows,
        // Include original snapshot stats
        snapshotStats: snapshot.stats,
      },
      {
        status: 200,
        headers: {
          // Don't cache probe results - they're point-in-time
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error probing pNodes:", error);
    return serverError("Failed to probe pNodes", error);
  }
}

