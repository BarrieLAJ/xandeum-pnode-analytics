import { rpcCall } from "@/lib/prpc/jsonRpcTransport";
import { TransportError, TransportErrorCode } from "@/lib/prpc/transport";
import { PnodeRow } from "@/lib/pnodes/model";
import { parsePrpcGetStatsResult } from "@/lib/pnodes/schemas";
import { STATS_CONFIG } from "@/lib/pnodes/constants";
import pLimit from "p-limit";
import { insertPodStatsSample } from "@/lib/db/queries";

interface StatsCollectionResult {
	pubkey: string;
	success: boolean;
	error?: string;
}

/**
 * Collect stats from a single node
 */
async function collectStatsFromNode(
	node: PnodeRow,
	ts: Date
): Promise<StatsCollectionResult> {
	const pubkey = node.pubkey;
	const prpcUrl = node.pod?.prpcUrl;

	// Only collect from nodes with RPC endpoints (public or private)
	if (!prpcUrl) {
		return {
			pubkey,
			success: false,
			error: "No RPC endpoint",
		};
	}

	try {
		const result = await rpcCall<unknown>(
			prpcUrl,
			"get-stats",
			[],
			STATS_CONFIG.TIMEOUT_MS
		);
		const stats = parsePrpcGetStatsResult(result.data);

		// Insert into database
		await insertPodStatsSample({
			ts,
			pubkey,
			prpcUrl,
			cpuPercent: stats.cpu_percent ?? null,
			ramUsedBytes: stats.ram_used ?? null,
			ramTotalBytes: stats.ram_total ?? null,
			uptimeSeconds: stats.uptime ?? null,
			packetsReceived: stats.packets_received ?? null,
			packetsSent: stats.packets_sent ?? null,
			activeStreams: stats.active_streams ?? null,
			raw: stats,
		});

		return { pubkey, success: true };
	} catch (error) {
		// Handle "Method not found" gracefully - not all nodes support get stats
		if (
			error instanceof TransportError &&
			error.code === TransportErrorCode.RPC_ERROR &&
			error.rpcError?.code === -32601
		) {
			return {
				pubkey,
				success: false,
				error: "Method not available",
			};
		}

		// Handle timeout gracefully
		if (
			error instanceof TransportError &&
			error.code === TransportErrorCode.TIMEOUT
		) {
			return {
				pubkey,
				success: false,
				error: "Timeout",
			};
		}

		// Handle network errors gracefully
		if (
			error instanceof TransportError &&
			error.code === TransportErrorCode.NETWORK_ERROR
		) {
			return {
				pubkey,
				success: false,
				error: "Network error",
			};
		}

		return {
			pubkey,
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Collect stats from multiple nodes with concurrency limiting
 * Collects from all nodes with RPC endpoints (public or private)
 */
export async function collectStatsFromNodes(
	nodes: PnodeRow[],
	ts: Date
): Promise<{
	collected: number;
	failed: number;
	skipped: number;
	errors: string[];
}> {
	const limit = pLimit(STATS_CONFIG.CONCURRENCY);
	const errors: string[] = [];

	// Filter to nodes with RPC endpoints (public or private)
	const nodesToCollect = nodes
		.filter((n) => n.pod?.prpcUrl)
		.slice(0, STATS_CONFIG.MAX_NODES_TO_COLLECT ?? nodes.length);

	const skipped = nodes.length - nodesToCollect.length;

	const results = await Promise.allSettled(
		nodesToCollect.map((node) =>
			limit(async () => {
				const result = await collectStatsFromNode(node, ts);
				if (!result.success && result.error) {
					errors.push(`${node.pubkey}: ${result.error}`);
				}
				return result;
			})
		)
	);

	const successful = results.filter(
		(r) => r.status === "fulfilled" && r.value.success
	).length;

	const failed = results.length - successful;

	return {
		collected: successful,
		failed,
		skipped,
		errors: errors.slice(0, 10), // Limit error messages
	};
}
