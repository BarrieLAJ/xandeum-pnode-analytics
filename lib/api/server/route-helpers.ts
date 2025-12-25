/**
 * Server-only route handler utilities
 * 
 * These helpers are for use in API route handlers only.
 * Do NOT export from lib/api/index.ts to prevent client-side imports.
 */

import { NextResponse } from "next/server";
import type { HistoryRange } from "@/lib/db/queries/types";
import { badRequest } from "../errors";

/**
 * Check if database is configured and return error response if not
 */
export function requireDatabase(
	databaseUrl: string | undefined
): NextResponse | null {
	if (!databaseUrl) {
		return badRequest(
			"DATABASE_URL_MISSING",
			"Historical data is not configured"
		);
	}
	return null;
}

/**
 * Parse history range query parameter
 * Returns "24h" as default if invalid
 */
export function parseRange(value: string | null): HistoryRange {
	if (value === "24h" || value === "7d" || value === "30d") return value;
	return "24h";
}

/**
 * Check if an error is a database "table does not exist" error
 */
export function isDbNotSetupError(error: unknown): boolean {
	const err = error as Error & { cause?: { code?: string } };
	return (
		err.cause?.code === "42P01" || err.message?.includes("does not exist")
	);
}

/**
 * Create a standardized response for database not setup errors
 */
export function dbNotSetupResponse(): NextResponse {
	return NextResponse.json(
		{
			error: "DATABASE_NOT_SETUP",
			message:
				"Database tables have not been created. Please run: pnpm db:setup",
		},
		{ status: 503 }
	);
}

