import { NextResponse } from "next/server";

/**
 * Standardized API error response shape.
 * All route handlers should use this format.
 */
export interface ApiErrorBody {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Create a standardized error response for route handlers.
 */
export function apiError(
  status: number,
  error: string,
  message?: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error };
  if (message) body.message = message;
  if (details !== undefined) body.details = details;

  return NextResponse.json(body, { status });
}

/**
 * Create a 400 Bad Request response
 */
export function badRequest(error: string, message?: string): NextResponse<ApiErrorBody> {
  return apiError(400, error, message);
}

/**
 * Create a 404 Not Found response
 */
export function notFound(error: string, message?: string, details?: unknown): NextResponse<ApiErrorBody> {
  return apiError(404, error, message, details);
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(error: string, message?: string): NextResponse<ApiErrorBody> {
  return apiError(403, error, message);
}

/**
 * Create a 500 Internal Server Error response
 */
export function serverError(error: string, cause?: unknown): NextResponse<ApiErrorBody> {
  const message = cause instanceof Error ? cause.message : undefined;
  return apiError(500, error, message);
}

