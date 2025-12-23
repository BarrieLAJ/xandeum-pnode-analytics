import { NextResponse } from "next/server";
import { rpcCall } from "@/lib/prpc/jsonRpcTransport";
import { TransportError, TransportErrorCode } from "@/lib/prpc/transport";
import { getPnodeById } from "@/lib/pnodes/service";
import { parsePrpcGetStatsResult, type PrpcGetStatsResult } from "@/lib/pnodes/schemas";
import { pnodeStatsCache } from "@/lib/cache/ttl";
import { env } from "@/lib/config/env";
import { insertPodStatsSample } from "@/lib/db/queries";
import { badRequest, notFound, serverError, timeoutError, serviceUnavailable } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/pnodes/[id]/stats
 *
 * Fetches live pRPC `get stats` for a specific pNode (hybrid mode: on-demand).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id: pubkey } = await params;

    if (!pubkey) {
      return badRequest("Missing pubkey parameter");
    }

    const node = await getPnodeById(pubkey);
    if (!node) {
      return notFound("pNode not found", undefined, { pubkey });
    }

    const prpcUrl = node.pod?.prpcUrl;
    const isPublic = node.pod?.isPublic ?? false;
    
    if (!prpcUrl) {
      return notFound("pNode pRPC endpoint not available", undefined, { pubkey });
    }
    
    // Only attempt stats on public nodes
    if (!isPublic) {
      return serviceUnavailable(
        "NOT_PUBLIC",
        "Stats are only available for public pNodes. This node is marked as private.",
        { pubkey, prpcUrl, isPublic: false }
      );
    }

    const cacheKey = `pnode:stats:${pubkey}`;
    let value: PrpcGetStatsResult;
    let fromCache: boolean;

    try {
      const result = await pnodeStatsCache.getOrSet(
        cacheKey,
        async () => {
          // Method name is "get-stats" (with a dash, not a space)
          const result = await rpcCall<unknown>(prpcUrl, "get-stats", []);
          return parsePrpcGetStatsResult(result.data);
        },
        15_000
      );
      value = result.value as PrpcGetStatsResult;
      fromCache = result.fromCache;
    } catch (error) {
      // Handle "Method not found" gracefully - not all nodes support get stats
      if (
        error instanceof TransportError &&
        error.code === TransportErrorCode.RPC_ERROR &&
        error.rpcError?.code === -32601
      ) {
        return notFound(
          "Stats method not available on this pNode",
          undefined,
          { pubkey, prpcUrl }
        );
      }
      
      // Handle timeout gracefully - node might be slow or unreachable
      if (
        error instanceof TransportError &&
        error.code === TransportErrorCode.TIMEOUT
      ) {
        return timeoutError(
          "TIMEOUT",
          "Request to pNode timed out. The node may be slow or unreachable.",
          { pubkey, prpcUrl }
        );
      }
      
      // Handle connection refused - node is down or port not accessible
      if (
        error instanceof TransportError &&
        error.code === TransportErrorCode.NETWORK_ERROR &&
        error.cause instanceof Error &&
        (error.cause.message.includes("ECONNREFUSED") ||
         error.cause.message.includes("connect ECONNREFUSED") ||
         (error.cause as any).code === "ECONNREFUSED")
      ) {
        return serviceUnavailable(
          "CONNECTION_REFUSED",
          "Cannot connect to pNode. Even though this node is marked as public, it may be behind a firewall, NAT, or the RPC port may not be accessible from this server's location.",
          { 
            pubkey, 
            prpcUrl,
            isPublic,
            note: "Public nodes may not always be reachable from all network locations"
          }
        );
      }
      
      // Handle other network errors (EHOSTUNREACH, ENETUNREACH, etc.)
      if (
        error instanceof TransportError &&
        error.code === TransportErrorCode.NETWORK_ERROR &&
        error.cause instanceof Error &&
        ((error.cause as any).code === "EHOSTUNREACH" ||
         (error.cause as any).code === "ENETUNREACH" ||
         error.cause.message.includes("ENETUNREACH") ||
         error.cause.message.includes("EHOSTUNREACH"))
      ) {
        return serviceUnavailable(
          "NETWORK_UNREACHABLE",
          "Network path to pNode is unreachable. The node may be behind a firewall or NAT.",
          { pubkey, prpcUrl, isPublic }
        );
      }
      
      throw error;
    }

    const statsResult = value;

    // If DB is configured, persist a sampled point (hybrid history).
    // Only persist when not served from cache to reduce duplicates.
    if (!fromCache && env.DATABASE_URL) {
      const now = new Date();
      // Stats are at the top level (flat structure), not nested in stats object
      await insertPodStatsSample({
        ts: now,
        pubkey,
        prpcUrl,
        cpuPercent: statsResult.cpu_percent ?? null,
        ramUsedBytes: statsResult.ram_used ?? null,
        ramTotalBytes: statsResult.ram_total ?? null,
        uptimeSeconds: statsResult.uptime ?? null,
        packetsReceived: statsResult.packets_received ?? null,
        packetsSent: statsResult.packets_sent ?? null,
        activeStreams: statsResult.active_streams ?? null,
        raw: statsResult,
      });
    }

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        pubkey,
        prpcUrl,
        fromCache,
        stats: statsResult,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pNode stats:", error);
    return serverError("Failed to fetch pNode stats", error);
  }
}


