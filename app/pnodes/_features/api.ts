/**
 * pNodes API client for pnodes directory features
 * Colocated with the features that use it
 */

import { apiGet } from "@/lib/api/client";
import type { SnapshotResponse, PnodeRow } from "@/lib/pnodes/model";

// ============================================================================
// Types
// ============================================================================

/**
 * GET /api/pnodes/snapshot response
 */
export interface SnapshotApiResponse extends SnapshotResponse {
	filters?: {
		search?: string;
		version?: string;
		hasRpc?: boolean;
		sortBy: string;
		sortOrder: "asc" | "desc";
		totalFiltered: number;
		totalUnfiltered: number;
	};
}

/**
 * GET /api/pnodes/probe response
 */
export interface ProbeApiResponse {
	generatedAt: string;
	probeDurationMs: number;
	stats: {
		totalProbed: number;
		reachable: number;
		unreachable: number;
		avgLatencyMs: number | null;
		minLatencyMs: number | null;
		maxLatencyMs: number | null;
	};
	rows: PnodeRow[];
	snapshotStats: SnapshotResponse["stats"];
}

export interface SnapshotParams {
	search?: string;
	version?: string;
	hasRpc?: boolean;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

// ============================================================================
// API methods
// ============================================================================

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

