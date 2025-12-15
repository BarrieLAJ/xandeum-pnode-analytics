import { rpcCall } from "@/lib/prpc/jsonRpcTransport";
import { TransportError, TransportErrorCode } from "@/lib/prpc/transport";
import { PnodeRow, PnodeProbeResult } from "@/lib/pnodes/model";
import pLimit from "p-limit";

/**
 * Probe timeout - shorter than normal calls since we're just checking health
 */
const PROBE_TIMEOUT_MS = 5000;

/**
 * Concurrency limit for probing to avoid overwhelming the network
 */
const PROBE_CONCURRENCY = 10;

/**
 * Probe a single node's RPC endpoint
 * Returns health status and latency
 */
export async function probeNode(node: PnodeRow): Promise<PnodeProbeResult> {
	const probedAt = new Date().toISOString();

	// If no RPC endpoint, mark as unreachable
	if (!node.endpoints.rpc) {
		return {
			rpcReachable: false,
			error: "No RPC endpoint advertised",
			probedAt,
		};
	}

	const rpcUrl = `http://${node.endpoints.rpc}`;

	try {
		const startTime = performance.now();

		// Try getHealth first (lightweight call)
		const result = await rpcCall<string>(
			rpcUrl,
			"getHealth",
			[],
			PROBE_TIMEOUT_MS
		);

		const latencyMs = performance.now() - startTime;

		// Try to get version info as well
		let rpcVersion: string | undefined;
		try {
			const versionResult = await rpcCall<{ "solana-core": string }>(
				rpcUrl,
				"getVersion",
				[],
				PROBE_TIMEOUT_MS
			);
			rpcVersion = versionResult.data["solana-core"];
		} catch {
			// Version call failed, but health succeeded
		}

		return {
			rpcReachable: result.data === "ok",
			latencyMs: Math.round(latencyMs),
			rpcVersion,
			probedAt,
		};
	} catch (error) {
		let errorMessage = "Unknown error";

		if (error instanceof TransportError) {
			switch (error.code) {
				case TransportErrorCode.TIMEOUT:
					errorMessage = "Request timed out";
					break;
				case TransportErrorCode.NETWORK_ERROR:
					errorMessage = "Network unreachable";
					break;
				case TransportErrorCode.RPC_ERROR:
					errorMessage = error.rpcError?.message ?? "RPC error";
					break;
				default:
					errorMessage = error.message;
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}

		return {
			rpcReachable: false,
			error: errorMessage,
			probedAt,
		};
	}
}

/**
 * Probe multiple nodes with concurrency limiting
 */
export async function probeNodes(
	nodes: PnodeRow[],
	concurrency = PROBE_CONCURRENCY
): Promise<Map<string, PnodeProbeResult>> {
	const limit = pLimit(concurrency);
	const results = new Map<string, PnodeProbeResult>();

	// Only probe nodes that have RPC endpoints
	const nodesToProbe = nodes.filter((n) => n.derived.hasRpc);

	const probePromises = nodesToProbe.map((node) =>
		limit(async () => {
			const result = await probeNode(node);
			results.set(node.pubkey, result);
		})
	);

	await Promise.all(probePromises);

	// Mark nodes without RPC as having no endpoint
	for (const node of nodes) {
		if (!results.has(node.pubkey)) {
			results.set(node.pubkey, {
				rpcReachable: false,
				error: "No RPC endpoint",
				probedAt: new Date().toISOString(),
			});
		}
	}

	return results;
}

/**
 * Enrich pNode rows with probe results
 */
export function enrichWithProbes(
	rows: PnodeRow[],
	probes: Map<string, PnodeProbeResult>
): PnodeRow[] {
	return rows.map((row) => ({
		...row,
		probe: probes.get(row.pubkey),
	}));
}

/**
 * Calculate probe statistics
 */
export function calculateProbeStats(probes: Map<string, PnodeProbeResult>): {
	totalProbed: number;
	reachable: number;
	unreachable: number;
	avgLatencyMs: number | null;
	minLatencyMs: number | null;
	maxLatencyMs: number | null;
} {
	const probeArray = Array.from(probes.values());
	const reachableProbes = probeArray.filter((p) => p.rpcReachable);
	const latencies = reachableProbes
		.map((p) => p.latencyMs)
		.filter((l): l is number => l !== undefined);

	return {
		totalProbed: probeArray.length,
		reachable: reachableProbes.length,
		unreachable: probeArray.length - reachableProbes.length,
		avgLatencyMs:
			latencies.length > 0
				? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
				: null,
		minLatencyMs: latencies.length > 0 ? Math.min(...latencies) : null,
		maxLatencyMs: latencies.length > 0 ? Math.max(...latencies) : null,
	};
}
