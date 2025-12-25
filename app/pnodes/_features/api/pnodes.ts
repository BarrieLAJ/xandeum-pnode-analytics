/**
 * pNodes API client functions
 */

import { apiGet } from "@/lib/api/client";
import type {
	SnapshotApiResponse,
	ProbeApiResponse,
	PnodeStatsApiResponse,
	SnapshotParams,
} from "./types";

/**
 * Fetch snapshot of all pNodes
 */
export function getSnapshot(
	params?: SnapshotParams
): Promise<SnapshotApiResponse> {
	return apiGet<SnapshotApiResponse>(
		"/api/pnodes/snapshot",
		params as Record<string, string | boolean | undefined>
	);
}

/**
 * Probe all pNode RPC endpoints for health/latency
 */
export function probeNodes(force = false): Promise<ProbeApiResponse> {
	return apiGet<ProbeApiResponse>("/api/pnodes/probe", { force });
}

/**
 * Fetch live pRPC stats for a single pNode
 */
export function getPnodeStats(pubkey: string): Promise<PnodeStatsApiResponse> {
	return apiGet<PnodeStatsApiResponse>(`/api/pnodes/${pubkey}/stats`);
}

