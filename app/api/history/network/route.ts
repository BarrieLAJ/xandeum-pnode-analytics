import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { serverError } from "@/lib/api/errors";
import {
	requireDatabase,
	parseRange,
	isDbNotSetupError,
	dbNotSetupResponse,
} from "@/lib/api/server/route-helpers";
import { getNetworkHistory } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/history/network?range=24h|7d|30d
 */
export async function GET(request: Request) {
	try {
		const dbCheck = requireDatabase(env.DATABASE_URL);
		if (dbCheck) return dbCheck;

		const { searchParams } = new URL(request.url);
		const range = parseRange(searchParams.get("range"));

		const rows = await getNetworkHistory(range);

		return NextResponse.json(
			{
				generatedAt: new Date().toISOString(),
				range,
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
		console.error("Error fetching network history:", error);

		if (isDbNotSetupError(error)) {
			return dbNotSetupResponse();
		}

		return serverError("Failed to fetch network history", error);
	}
}
