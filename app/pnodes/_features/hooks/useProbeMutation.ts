"use client";

import { useMutation, useQueryClient } from "@/lib/query/client";
import { updateQueryData, invalidateQuery } from "@/lib/query/cache";
import { probeNodes } from "../api";
import type { ProbeApiResponse, SnapshotApiResponse } from "../api";
import { queryKeys } from "@/lib/query/keys";

/**
 * Hook for probing pNode RPC endpoints
 *
 * This is a mutation because:
 * - It's an expensive operation
 * - It has side effects (updates node data with probe results)
 * - We want explicit control over when it runs
 */
export function useProbeMutation() {
	const queryClient = useQueryClient();

	return useMutation<ProbeApiResponse, Error, boolean>({
		mutationFn: (force: boolean = true) => probeNodes(force),
		onSuccess: (data: ProbeApiResponse) => {
			// Update the snapshot cache with probed rows
			updateQueryData<SnapshotApiResponse>(
				queryClient,
				queryKeys.pnodes.snapshot(),
				(old) => {
					if (!old) return old;
					return {
						...old,
						rows: data.rows,
					};
				}
			);

			// Also invalidate to ensure fresh data on next fetch
			invalidateQuery(queryClient, queryKeys.pnodes.all);
		},
	});
}
