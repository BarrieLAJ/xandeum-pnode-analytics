/**
 * Shared internal API client for browser-side fetch calls to /api/* routes.
 *
 * Provides:
 * - Consistent error handling with typed ApiClientError
 * - Query parameter serialization
 * - JSON parsing with type safety
 */

/**
 * Standardized API error shape (matches our normalized route handler errors)
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Custom error class for API client errors
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly errorCode: string;
  readonly details?: unknown;

  constructor(status: number, errorCode: string, message?: string, details?: unknown) {
    super(message || errorCode);
    this.name = "ApiClientError";
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }

  static fromResponse(status: number, body: ApiErrorResponse): ApiClientError {
    return new ApiClientError(status, body.error, body.message, body.details);
  }
}

/**
 * Serialize query parameters, filtering out undefined/null values
 */
export function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return "";

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }

  return `?${searchParams.toString()}`;
}

/**
 * Base fetch wrapper with consistent error handling
 */
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch (error) {
    // Network error (offline, DNS failure, etc.)
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed"
    );
  }

  // Try to parse JSON body (even for errors)
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // Not JSON or empty response
    if (!response.ok) {
      throw new ApiClientError(
        response.status,
        "HTTP_ERROR",
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
    // Success but no JSON body (unusual for our API)
    return undefined as T;
  }

  // Handle error responses
  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    throw ApiClientError.fromResponse(response.status, {
      error: errorBody?.error || "UNKNOWN_ERROR",
      message: errorBody?.message || `Request failed with status ${response.status}`,
      details: errorBody?.details,
    });
  }

  return body as T;
}

/**
 * GET request with optional query parameters
 */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<T> {
  const url = endpoint + buildQueryString(params);
  return request<T>(url, { method: "GET" });
}

/**
 * POST request with JSON body
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

