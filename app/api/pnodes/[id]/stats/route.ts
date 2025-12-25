import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api/errors";
import { fetchPnodeStats } from "../../_services/stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
	params: Promise<{ id: string }>;
}

/**
 * GET /api/pnodes/[id]/stats
 *
 * Fetches live pRPC `get stats` for a specific pNode (hybrid mode: on-demand).
 */
export async function GET(_request: Request, { params }: RouteParams) {
	try {
		const { id: pubkey } = await params;

		if (!pubkey) {
			return badRequest("Missing pubkey parameter");
		}

		const result = await fetchPnodeStats(pubkey);

		// If result is an error response, return it
		if (result instanceof NextResponse) {
			return result;
		}

		return NextResponse.json(
			{
				generatedAt: new Date().toISOString(),
				...result,
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
				},
			}
		);
	} catch (error) {
		console.error("Error fetching pNode stats:", error);
		return serverError("Failed to fetch pNode stats", error);
	}
}
