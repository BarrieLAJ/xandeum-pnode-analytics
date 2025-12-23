"use client";

import { useQuery } from "@/lib/query/client";
import { getGeoData, GeoApiResponse } from "../api-geo";
import { queryKeys } from "@/lib/query/keys";

/**
 * Hook for the world map component
 */
export function useWorldMapData() {
	const query = useQuery<GeoApiResponse, Error>({
		queryKey: queryKeys.geo.data(100),
		queryFn: () => getGeoData(100), // World map needs more nodes
		enabled: true, // Auto-load on mount
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		retry: false, // Don't retry on failure (rate limiting)
	});

	return {
		data: query.data ?? null,
		isLoading: query.isFetching,
		error: query.error,
		// Manual trigger for refreshing geo data
		loadGeoData: () => query.refetch(),
		// Whether data has been loaded
		hasData: !!query.data,
	};
}
