/**
 * API client module exports
 *
 * Note: Feature-specific API clients are colocated in their respective _features folders.
 * This module only exports shared infrastructure.
 */

// Client utilities (shared infrastructure)
export { apiGet, apiPost, buildQueryString, ApiClientError } from "./client";
export type { ApiErrorResponse } from "./client";

// Error helpers (for route handlers)
export {
	apiError,
	badRequest,
	notFound,
	forbidden,
	serverError,
} from "./errors";
export type { ApiErrorBody } from "./errors";
