/**
 * Geo API client for home page features
 * Colocated with the features that use it
 */

import { apiGet } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// API methods
// ============================================================================

/**
 * Fetch geographic data for pNode IPs
 */
export function getGeoData(limit = 50): Promise<GeoApiResponse> {
	return apiGet<GeoApiResponse>("/api/pnodes/geo", { limit });
}

