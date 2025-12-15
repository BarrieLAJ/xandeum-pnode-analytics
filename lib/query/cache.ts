/**
 * Query cache manipulation utilities
 * Abstracts react-query cache operations
 */

import type { QueryClient } from "@tanstack/react-query";

/**
 * Update query data in cache
 */
export function updateQueryData<TData>(
	queryClient: QueryClient,
	queryKey: readonly unknown[],
	updater: (old: TData | undefined) => TData | undefined
): void {
	queryClient.setQueryData<TData>(queryKey, updater);
}

/**
 * Invalidate query cache
 */
export function invalidateQuery(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
): void {
	queryClient.invalidateQueries({
		queryKey,
		refetchType: "none",
	});
}

/**
 * Get query data from cache
 */
export function getQueryData<TData>(
	queryClient: QueryClient,
	queryKey: readonly unknown[]
): TData | undefined {
	return queryClient.getQueryData<TData>(queryKey);
}
