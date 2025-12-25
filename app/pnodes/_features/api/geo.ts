/**
 * Geo API client functions
 */

import { apiGet } from "@/lib/api/client";
import type { GeoApiResponse } from "./types";

/**
 * Fetch geographic data for pNode IPs
 */
export function getGeoData(limit = 50): Promise<GeoApiResponse> {
	return apiGet<GeoApiResponse>("/api/pnodes/geo", { limit });
}

