import { NextResponse } from "next/server";
import { getSnapshot, filterPnodes, sortPnodes } from "@/lib/pnodes/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/pnodes/snapshot
 *
 * Returns the current snapshot of all pNodes from gossip.
 *
 * Query parameters:
 * - search: Filter by pubkey/IP/version (partial match)
 * - version: Filter by exact version
 * - hasRpc: Filter by RPC endpoint availability (true/false)
 * - sortBy: Sort field (pubkey, version, shredVersion, endpointCount, ip)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get the snapshot (cached or fresh)
    const snapshot = await getSnapshot();

    // Extract filter/sort params
    const search = searchParams.get("search") ?? undefined;
    const version = searchParams.get("version") ?? undefined;
    const hasRpcParam = searchParams.get("hasRpc");
    const hasRpc =
      hasRpcParam === "true" ? true : hasRpcParam === "false" ? false : undefined;
    const sortBy = searchParams.get("sortBy") ?? "pubkey";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") ?? "asc";

    // Apply filters
    let rows = snapshot.rows;
    if (search || version || hasRpc !== undefined) {
      rows = filterPnodes(rows, { search, version, hasRpc });
    }

    // Apply sorting
    rows = sortPnodes(rows, sortBy, sortOrder);

    // Return filtered/sorted snapshot
    return NextResponse.json(
      {
        ...snapshot,
        rows,
        // Include filter metadata
        filters: {
          search,
          version,
          hasRpc,
          sortBy,
          sortOrder,
          totalFiltered: rows.length,
          totalUnfiltered: snapshot.rows.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pNodes snapshot:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch pNodes snapshot",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

