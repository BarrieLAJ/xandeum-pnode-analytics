import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/pnodes/service";
import {
	batchLookupIps,
	calculateGeoDistribution,
} from "../_services/geo";
import { notFound, serverError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Geo lookup can take a while
export const maxDuration = 120;

/**
 * GET /api/pnodes/geo
 *
 * Looks up geographic information for all pNode IPs.
 * This is rate-limited by the upstream service, so use sparingly.
 *
 * Query parameters:
 * - limit: Max number of IPs to lookup (default: 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

    const startTime = performance.now();

    // Get current snapshot
    const snapshot = await getSnapshot();

    if (snapshot.rows.length === 0) {
      return notFound("No pNodes available");
    }

    // Extract unique IPs
    const ips = snapshot.rows
      .map((row) => row.derived.ipAddress)
      .filter((ip): ip is string => Boolean(ip))
      .slice(0, limit);

    // Batch lookup with rate limiting
    const geoData = await batchLookupIps(ips, 50); // 50ms delay between requests

    // Calculate distribution
    const distribution = calculateGeoDistribution(geoData);

    // Build detailed results
    const nodeGeo = snapshot.rows.slice(0, limit).map((row) => ({
      pubkey: row.pubkey,
      shortPubkey: row.derived.shortPubkey,
      ip: row.derived.ipAddress,
      geo: row.derived.ipAddress ? geoData.get(row.derived.ipAddress) : null,
    }));

    const durationMs = performance.now() - startTime;

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        lookupDurationMs: Math.round(durationMs),
        totalNodes: snapshot.stats.totalNodes,
        nodesLookedUp: ips.length,
        distribution,
        nodes: nodeGeo,
      },
      {
        status: 200,
        headers: {
          // Cache geo results for 1 hour
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error looking up geo data:", error);
    return serverError("Failed to lookup geo data", error);
  }
}

