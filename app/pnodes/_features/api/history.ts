/**
 * History API client functions
 */

import { apiGet } from "@/lib/api/client";
import type {
	NetworkHistoryApiResponse,
	PodHistoryApiResponse,
	PodStatsHistoryApiResponse,
} from "./types";

export function getNetworkHistory(
	range: "24h" | "7d" | "30d" = "24h"
): Promise<NetworkHistoryApiResponse> {
	return apiGet<NetworkHistoryApiResponse>("/api/history/network", { range });
}

export function getPodHistory(
	pubkey: string,
	range: "24h" | "7d" | "30d" = "24h"
): Promise<PodHistoryApiResponse> {
	return apiGet<PodHistoryApiResponse>(`/api/history/pod/${pubkey}`, {
		range,
	});
}

export function getPodStatsHistory(
	pubkey: string,
	range: "24h" | "7d" | "30d" = "24h"
): Promise<PodStatsHistoryApiResponse> {
	return apiGet<PodStatsHistoryApiResponse>(
		`/api/history/pod/${pubkey}/stats`,
		{
			range,
		}
	);
}

