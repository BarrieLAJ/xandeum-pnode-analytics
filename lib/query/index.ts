/**
 * React Query setup and abstraction layer
 *
 * This module exports the query provider and abstraction layer.
 * Feature-specific hooks are colocated in their respective _features folders.
 */

// Provider
export { QueryProvider } from "./QueryProvider";

// Query keys
export { queryKeys } from "./keys";

// Abstraction layer (hides react-query implementation details)
export {
	useQuery,
	useMutation,
	useQueryClient,
	type QueryResult,
	type MutationResult,
	type QueryOptions,
	type MutationOptions,
	type QueryKey,
} from "./client";

// Cache utilities
export { updateQueryData, invalidateQuery, getQueryData } from "./cache";
