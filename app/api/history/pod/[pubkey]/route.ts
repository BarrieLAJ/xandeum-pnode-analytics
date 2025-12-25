import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { badRequest, serverError } from "@/lib/api/errors";
import {
	requireDatabase,
	parseRange,
	isDbNotSetupError,
	dbNotSetupResponse,
} from "@/lib/api/server/route-helpers";
import { getPodHistory } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
	params: Promise<{ pubkey: string }>;
}

/**
 * GET /api/history/pod/[pubkey]?range=24h|7d|30d
 */
export async function GET(request: Request, { params }: RouteParams) {
	try {
		const dbCheck = requireDatabase(env.DATABASE_URL);
		if (dbCheck) return dbCheck;

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

		if (isDbNotSetupError(error)) {
			return dbNotSetupResponse();
		}

		return serverError("Failed to fetch pod history", error);
	}
}
