import { z } from "zod";

/**
 * Zod schema for a single node from getClusterNodes response
 *
 * Based on actual Xandeum devnet response:
 * {
 *   "pubkey": "4jukF893ntbfTWHpEn1jK7ZjPEKXpMdVgQd3HeskMzHo",
 *   "gossip": "23.83.67.172:8000",
 *   "rpc": "23.83.67.172:8899",
 *   "pubsub": "23.83.67.172:8900",
 *   "tpu": "23.83.67.172:8003",
 *   "tpuForwards": "23.83.67.172:8004",
 *   "tpuForwardsQuic": "23.83.67.172:8010",
 *   "tpuQuic": "23.83.67.172:8009",
 *   "tpuVote": "23.83.67.172:8005",
 *   "tvu": "23.83.67.172:8001",
 *   "serveRepair": "23.83.67.172:8012",
 *   "version": "2.2.0-7c3f39e8",
 *   "featureSet": 3294202862,
 *   "shredVersion": 48698
 * }
 */
export const ClusterNodeSchema = z.object({
	// Identity
	pubkey: z.string(),

	// Network endpoints (host:port format)
	gossip: z.string().optional(),
	rpc: z.string().optional(),
	pubsub: z.string().optional(),
	tpu: z.string().optional(),
	tpuForwards: z.string().optional(),
	tpuForwardsQuic: z.string().optional(),
	tpuQuic: z.string().optional(),
	tpuVote: z.string().optional(),
	tvu: z.string().optional(),
	serveRepair: z.string().optional(),

	// Software info
	version: z.string().optional(),
	featureSet: z.number().optional(),
	shredVersion: z.number().optional(),
});

export type ClusterNode = z.infer<typeof ClusterNodeSchema>;

/**
 * Schema for the full getClusterNodes response array
 */
export const GetClusterNodesResponseSchema = z.array(ClusterNodeSchema);

export type GetClusterNodesResponse = z.infer<
	typeof GetClusterNodesResponseSchema
>;

/**
 * Validate and parse getClusterNodes response
 */
export function parseClusterNodes(data: unknown): GetClusterNodesResponse {
	return GetClusterNodesResponseSchema.parse(data);
}

/**
 * Safe parse with error details
 */
export function safeParseClusterNodes(data: unknown): {
	success: boolean;
	data?: GetClusterNodesResponse;
	error?: z.ZodError;
} {
	const result = GetClusterNodesResponseSchema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, error: result.error };
}

// ============================================================================
// Xandeum pNode pRPC (get-pods-with-stats)
// ============================================================================

/**
 * Schema for a single pNode pod returned by `get-pods-with-stats`.
 *
 * Example:
 * {
 *   "address": "173.212.207.32:9001",
 *   "is_public": true,
 *   "last_seen_timestamp": 1765877479,
 *   "pubkey": "EcTqXgB6VJStAtBZAXcjLHf5ULj41H1PFZQ17zKosbhL",
 *   "rpc_port": 6000,
 *   "storage_committed": 340000000000,
 *   "storage_usage_percent": 0.0000285,
 *   "storage_used": 96947,
 *   "uptime": 107640,
 *   "version": "0.8.0"
 * }
 */
// Some pods occasionally contain null fields (partial data). We tolerate that and
// normalize to a strict shape so one bad pod doesn't kill the whole response.
const PodWithStatsRawSchema = z.object({
	address: z.string().nullable(),
	is_public: z.boolean().nullable(),
	last_seen_timestamp: z.number().nullable(),
	pubkey: z.string().nullable(),
	rpc_port: z.number().nullable(),
	storage_committed: z.number().nullable(),
	storage_usage_percent: z.number().nullable(),
	storage_used: z.number().nullable(),
	uptime: z.number().nullable(),
	version: z.string().nullable(),
});

export type PodWithStats = {
	address: string;
	is_public: boolean;
	last_seen_timestamp: number;
	pubkey: string;
	rpc_port: number;
	storage_committed: number;
	storage_usage_percent: number;
	storage_used: number;
	uptime: number;
	version: string;
};

const GetPodsWithStatsResultRawSchema = z.object({
	pods: z.array(PodWithStatsRawSchema),
});

export type GetPodsWithStatsResult = {
	pods: PodWithStats[];
};

export function parsePodsWithStatsResult(
	data: unknown
): GetPodsWithStatsResult {
	const raw = GetPodsWithStatsResultRawSchema.parse(data);

	const pods: PodWithStats[] = [];
	for (const p of raw.pods) {
		// Must-have fields
		if (!p.pubkey || !p.address) continue;

		pods.push({
			address: p.address,
			pubkey: p.pubkey,
			is_public: p.is_public ?? false,
			version: p.version ?? "unknown",
			rpc_port: p.rpc_port ?? 6000,
			last_seen_timestamp: p.last_seen_timestamp ?? 0,
			storage_committed: p.storage_committed ?? 0,
			storage_usage_percent: p.storage_usage_percent ?? 0,
			storage_used: p.storage_used ?? 0,
			uptime: p.uptime ?? 0,
		});
	}

	return { pods };
}

/**
 * Schema for `get-stats` (pNode pRPC) result.
 *
 * Actual response structure (flat, not nested):
 * {
 *   "file_size": 140000000000,
 *   "active_streams": 2,
 *   "cpu_percent": 0.4926108419895172,
 *   "current_index": 4,
 *   "last_updated": 1766400915,
 *   "packets_received": 9790967,
 *   "packets_sent": 10982855,
 *   "ram_total": 12541509632,
 *   "ram_used": 706211840,
 *   "total_bytes": 49001,
 *   "total_pages": 1,
 *   "uptime": 302255
 * }
 *
 * See: https://docs.xandeum.network/api/pnode-rpc-prpc-reference
 */
export const PrpcGetStatsResultSchema = z
	.object({
		// All fields are at the top level (flat structure)
		file_size: z.number().optional(),
		active_streams: z.number().optional(),
		cpu_percent: z.number().optional(),
		current_index: z.number().optional(),
		last_updated: z.number().optional(),
		packets_received: z.number().optional(),
		packets_sent: z.number().optional(),
		ram_total: z.number().optional(),
		ram_used: z.number().optional(),
		total_bytes: z.number().optional(),
		total_pages: z.number().optional(),
		uptime: z.number().optional(),
	})
	.passthrough(); // Allow additional fields we might not know about

export type PrpcGetStatsResult = z.infer<typeof PrpcGetStatsResultSchema>;

export function parsePrpcGetStatsResult(data: unknown): PrpcGetStatsResult {
	return PrpcGetStatsResultSchema.parse(data);
}
