import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { badRequest, serverError } from "@/lib/api/errors";
import { getPodHistory, type HistoryRange } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseRange(value: string | null): HistoryRange {
	if (value === "24h" || value === "7d" || value === "30d") return value;
	return "24h";
}

interface RouteParams {
	params: Promise<{ pubkey: string }>;
}

/**
 * GET /api/history/pod/[pubkey]?range=24h|7d|30d
 */
export async function GET(request: Request, { params }: RouteParams) {
	try {
		if (!env.DATABASE_URL) {
			return badRequest(
				"DATABASE_URL_MISSING",
				"Historical data is not configured"
			);
		}

		const { pubkey } = await params;
		if (!pubkey) {
			return badRequest("MISSING_PUBKEY", "Missing pubkey parameter");
		}

		const { searchParams } = new URL(request.url);
		const range = parseRange(searchParams.get("range"));

		const rows = await getPodHistory(pubkey, range);

		return NextResponse.json(
			{
				generatedAt: new Date().toISOString(),
				range,
				pubkey,
				points: rows,
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
				},
			}
		);
	} catch (error) {
		console.error("Error fetching pod history:", error);
		const err = error as Error;

		// Check if tables don't exist
		if (
			// @ts-expect-error - cause is not typed
			err.cause?.code === "42P01" ||
			err.message?.includes("does not exist")
		) {
			return NextResponse.json(
				{
					error: "DATABASE_NOT_SETUP",
					message:
						"Database tables have not been created. Please run: pnpm db:setup",
				},
				{ status: 503 }
			);
		}

		return serverError("Failed to fetch pod history", error);
	}
}
