/**
 * React Query abstraction layer
 * Hides implementation details of @tanstack/react-query
 */

import {
	useQuery as reactUseQuery,
	useMutation as reactUseMutation,
	useQueryClient as reactUseQueryClient,
	type QueryClient,
} from "@tanstack/react-query";

/**
 * Generic query result
 */
export interface QueryResult<TData, TError = Error> {
	data: TData | undefined;
	isLoading: boolean;
	isFetching: boolean;
	error: TError | null;
	refetch: () => void;
}

/**
 * Generic mutation result
 */
export interface MutationResult<TData, TError = Error, TVariables = void> {
	mutate: (
		variables: TVariables,
		options?: MutationOptions<TData, TError>
	) => void;
	mutateAsync: (
		variables: TVariables,
		options?: MutationOptions<TData, TError>
	) => Promise<TData>;
	isPending: boolean;
	isError: boolean;
	error: TError | null;
	data: TData | undefined;
	reset: () => void;
}

/**
 * Mutation options
 */
export interface MutationOptions<TData, TError> {
	onSuccess?: (data: TData) => void;
	onError?: (error: TError) => void;
}

/**
 * Query options (simplified from react-query)
 */
export interface QueryOptions<TData, TError = Error> {
	enabled?: boolean;
	staleTime?: number;
	gcTime?: number;
	retry?: boolean | number;
	refetchOnWindowFocus?: boolean;
}

/**
 * Abstraction for useQuery hook
 */
export function useQuery<TData, TError = Error>(
	options: {
		queryKey: readonly unknown[];
		queryFn: () => Promise<TData>;
	} & QueryOptions<TData, TError>
): QueryResult<TData, TError> {
	const result = reactUseQuery<TData, TError>({
		queryKey: options.queryKey,
		queryFn: options.queryFn,
		enabled: options.enabled,
		staleTime: options.staleTime,
		gcTime: options.gcTime,
		retry: options.retry,
		refetchOnWindowFocus: options.refetchOnWindowFocus,
	});

	return {
		data: result.data,
		isLoading: result.isLoading,
		isFetching: result.isFetching,
		error: result.error,
		refetch: () => result.refetch(),
	};
}

/**
 * Abstraction for useMutation hook
 */
export function useMutation<TData, TError = Error, TVariables = void>(options: {
	mutationFn: (variables: TVariables) => Promise<TData>;
	onSuccess?: (data: TData) => void;
	onError?: (error: TError) => void;
}): MutationResult<TData, TError, TVariables> {
	const result = reactUseMutation<TData, TError, TVariables>({
		mutationFn: options.mutationFn,
		onSuccess: options.onSuccess,
		onError: options.onError,
	});

	return {
		mutate: (variables, opts) => {
			result.mutate(variables, {
				onSuccess: opts?.onSuccess ?? options.onSuccess,
				onError: opts?.onError ?? options.onError,
			});
		},
		mutateAsync: (variables, opts) => {
			return result.mutateAsync(variables, {
				onSuccess: opts?.onSuccess ?? options.onSuccess,
				onError: opts?.onError ?? options.onError,
			});
		},
		isPending: result.isPending,
		isError: result.isError,
		error: result.error,
		data: result.data,
		reset: () => result.reset(),
	};
}

/**
 * Abstraction for useQueryClient hook
 */
export function useQueryClient(): QueryClient {
	return reactUseQueryClient();
}

/**
 * Query key factory type
 */
export type QueryKey = readonly unknown[];
