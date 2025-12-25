/**
 * API response types for pNodes feature
 */

import type { SnapshotResponse, PnodeRow } from "@/lib/pnodes/model";
import type { PrpcGetStatsResult } from "@/lib/pnodes/schemas";

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

/**
 * Geo location data for a single node
 */
export interface NodeGeoData {
	pubkey: string;
	shortPubkey: string;
	ip: string | null;
	geo: {
		country: string;
		countryCode: string;
		city: string;
		lat: number;
		lon: number;
		isp: string;
	} | null;
}

/**
 * GET /api/pnodes/geo response
 */
export interface GeoApiResponse {
	generatedAt: string;
	lookupDurationMs: number;
	totalNodes: number;
	nodesLookedUp: number;
	distribution: {
		byCountry: Record<string, number>;
		byCity: Record<string, number>;
		byIsp: Record<string, number>;
		totalWithGeo: number;
		totalWithoutGeo: number;
	};
	nodes: NodeGeoData[];
}

