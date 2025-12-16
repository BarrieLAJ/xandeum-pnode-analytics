/**
 * pNodes API client for pnodes directory features
 * Colocated with the features that use it
 */

import { apiGet } from "@/lib/api/client";
import type { SnapshotResponse, PnodeRow } from "@/lib/pnodes/model";
import type { PrpcGetStatsResult } from "@/lib/pnodes/schemas";

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

/**
 * GET /api/pnodes/[id]/stats response
 */
export interface PnodeStatsApiResponse {
	generatedAt: string;
	pubkey: string;
	prpcUrl: string;
	fromCache: boolean;
	stats: PrpcGetStatsResult;
}

export interface NetworkHistoryApiResponse {
	generatedAt: string;
	range: "24h" | "7d" | "30d";
	points: Array<{
		ts: string;
		totalPods: number;
		publicPods: number;
		totalStorageCommittedBytes: number;
		totalStorageUsedBytes: number;
		uniqueVersions: number;
		modalVersion: string | null;
		versionDistribution: Record<string, number> | null;
	}>;
}

export interface PodHistoryApiResponse {
	generatedAt: string;
	range: "24h" | "7d" | "30d";
	pubkey: string;
	points: Array<{
		ts: string;
		pubkey: string;
		ip: string | null;
		address: string | null;
		prpcPort: number | null;
		prpcUrl: string | null;
		isPublic: boolean;
		version: string | null;
		lastSeenTimestamp: number | null;
		uptimeSeconds: number | null;
		storageCommittedBytes: number | null;
		storageUsedBytes: number | null;
		storageUsagePercent: number | null;
	}>;
}

export interface PodStatsHistoryApiResponse {
	generatedAt: string;
	range: "24h" | "7d" | "30d";
	pubkey: string;
	points: Array<{
		ts: string;
		pubkey: string;
		prpcUrl: string | null;
		cpuPercent: number | null;
		ramUsedBytes: number | null;
		ramTotalBytes: number | null;
		uptimeSeconds: number | null;
		packetsReceived: number | null;
		packetsSent: number | null;
		activeStreams: number | null;
		raw: unknown;
	}>;
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

/**
 * Fetch live pRPC stats for a single pNode
 */
export function getPnodeStats(pubkey: string): Promise<PnodeStatsApiResponse> {
	return apiGet<PnodeStatsApiResponse>(`/api/pnodes/${pubkey}/stats`);
}

export function getNetworkHistory(range: "24h" | "7d" | "30d" = "24h") {
	return apiGet<NetworkHistoryApiResponse>("/api/history/network", { range });
}

export function getPodHistory(pubkey: string, range: "24h" | "7d" | "30d" = "24h") {
	return apiGet<PodHistoryApiResponse>(`/api/history/pod/${pubkey}`, { range });
}

export function getPodStatsHistory(
	pubkey: string,
	range: "24h" | "7d" | "30d" = "24h"
) {
	return apiGet<PodStatsHistoryApiResponse>(`/api/history/pod/${pubkey}/stats`, {
		range,
	});
}

