import { rpcCall } from "@/lib/prpc/jsonRpcTransport";
import { TransportError } from "@/lib/prpc/transport";
import { getPrpcUrl, getSnapshotCacheTtlSeconds } from "@/lib/config/env";
import { snapshotCache, nodeDetailCache } from "@/lib/cache/ttl";
import { parseClusterNodes, GetClusterNodesResponse } from "./schemas";
import {
  PnodeRow,
  SnapshotResponse,
  SnapshotStats,
  clusterNodeToPnodeRow,
  computeStats,
} from "./model";

const SNAPSHOT_CACHE_KEY = "pnodes:snapshot";
const NODE_CACHE_PREFIX = "pnode:";

/**
 * Fetch all pNodes from the cluster using getClusterNodes RPC call
 */
async function fetchClusterNodes(): Promise<{
  nodes: GetClusterNodesResponse;
  durationMs: number;
}> {
  const url = getPrpcUrl();
  const result = await rpcCall<GetClusterNodesResponse>(
    url,
    "getClusterNodes",
    []
  );

  // Validate the response with Zod
  const validated = parseClusterNodes(result.data);

  return {
    nodes: validated,
    durationMs: result.durationMs,
  };
}

/**
 * Get the current snapshot of all pNodes
 * Uses caching with stale fallback on errors
 */
export async function getSnapshot(): Promise<SnapshotResponse> {
  const prpcUrl = getPrpcUrl();
  const cacheTtlMs = getSnapshotCacheTtlSeconds() * 1000;

  // Check cache first
  const cached = snapshotCache.get(SNAPSHOT_CACHE_KEY) as
    | SnapshotResponse
    | undefined;
  if (cached) {
    return cached;
  }

  try {
    // Fetch fresh data
    const { nodes, durationMs } = await fetchClusterNodes();

    // Transform to canonical rows
    const rows: PnodeRow[] = nodes.map(clusterNodeToPnodeRow);

    // Compute stats
    const stats: SnapshotStats = computeStats(rows);

    // Build response
    const response: SnapshotResponse = {
      generatedAt: new Date().toISOString(),
      source: {
        prpcUrl,
        method: "getClusterNodes",
      },
      stale: false,
      fetchDurationMs: durationMs,
      rows,
      stats,
    };

    // Cache the response
    snapshotCache.set(SNAPSHOT_CACHE_KEY, response, cacheTtlMs);

    return response;
  } catch (error) {
    // Try to return stale cache on error
    const staleData = snapshotCache.getStale(SNAPSHOT_CACHE_KEY) as
      | SnapshotResponse
      | undefined;

    if (staleData) {
      return {
        ...staleData,
        stale: true,
        errors: [
          error instanceof Error ? error.message : "Unknown error fetching data",
        ],
      };
    }

    // No cache available, create error response
    const errorMessage =
      error instanceof TransportError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : "Unknown error";

    return {
      generatedAt: new Date().toISOString(),
      source: {
        prpcUrl,
        method: "getClusterNodes",
      },
      stale: false,
      errors: [errorMessage],
      rows: [],
      stats: {
        totalNodes: 0,
        nodesWithRpc: 0,
        nodesWithPubsub: 0,
        versionDistribution: {},
        uniqueVersions: 0,
        modalVersion: null,
      },
    };
  }
}

/**
 * Get a single pNode by pubkey
 * First tries to find in cached snapshot, then fetches if needed
 */
export async function getPnodeById(pubkey: string): Promise<PnodeRow | null> {
  const cacheKey = `${NODE_CACHE_PREFIX}${pubkey}`;

  // Check node-specific cache
  const cached = nodeDetailCache.get(cacheKey) as PnodeRow | undefined;
  if (cached) {
    return cached;
  }

  // Get snapshot (uses its own caching)
  const snapshot = await getSnapshot();

  // Find the node
  const node = snapshot.rows.find((row) => row.pubkey === pubkey);

  if (node) {
    // Cache the individual node
    nodeDetailCache.set(cacheKey, node);
  }

  return node ?? null;
}

/**
 * Search/filter pNodes by various criteria
 */
export function filterPnodes(
  rows: PnodeRow[],
  options: {
    search?: string;
    version?: string;
    hasRpc?: boolean;
    hasPubsub?: boolean;
  }
): PnodeRow[] {
  let filtered = rows;

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      (row) =>
        row.pubkey.toLowerCase().includes(searchLower) ||
        row.derived.ipAddress?.includes(searchLower) ||
        row.version?.toLowerCase().includes(searchLower)
    );
  }

  if (options.version) {
    filtered = filtered.filter((row) => row.version === options.version);
  }

  if (options.hasRpc !== undefined) {
    filtered = filtered.filter((row) => row.derived.hasRpc === options.hasRpc);
  }

  if (options.hasPubsub !== undefined) {
    filtered = filtered.filter(
      (row) => row.derived.hasPubsub === options.hasPubsub
    );
  }

  return filtered;
}

/**
 * Sort pNodes by various fields
 */
export function sortPnodes(
  rows: PnodeRow[],
  sortBy: string,
  sortOrder: "asc" | "desc" = "asc"
): PnodeRow[] {
  const sorted = [...rows];
  const multiplier = sortOrder === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "pubkey":
        return multiplier * a.pubkey.localeCompare(b.pubkey);
      case "version":
        return (
          multiplier * (a.version ?? "").localeCompare(b.version ?? "")
        );
      case "shredVersion":
        return multiplier * ((a.shredVersion ?? 0) - (b.shredVersion ?? 0));
      case "endpointCount":
        return (
          multiplier * (a.derived.endpointCount - b.derived.endpointCount)
        );
      case "ip":
        return (
          multiplier *
          (a.derived.ipAddress ?? "").localeCompare(b.derived.ipAddress ?? "")
        );
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Clear all caches (useful for testing or forced refresh)
 */
export function clearCaches(): void {
  snapshotCache.clear();
  nodeDetailCache.clear();
}

