/**
 * API response types shared between server and client
 * These types represent the shape of data returned by API endpoints
 */

import type { SnapshotResponse, SnapshotStats } from "./domain";

/**
 * Snapshot API response with filter metadata
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

