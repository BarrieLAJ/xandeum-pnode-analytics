import { NextResponse } from "next/server";
import { fetchPodCredits } from "@/lib/pnodes/credits";
import { serverError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds

/**
 * GET /api/pnodes/credits
 *
 * Returns credits for all pods from the Xandeum Credits API.
 * Returns a map of pubkey -> credits.
 */
export async function GET() {
	try {
		const creditsMap = await fetchPodCredits();

		// Convert Map to object for JSON serialization
		const credits: Record<string, number> = {};
		creditsMap.forEach((creditsValue, pubkey) => {
			credits[pubkey] = creditsValue;
		});

		return NextResponse.json(
			{
				generatedAt: new Date().toISOString(),
				credits,
				totalPods: Object.keys(credits).length,
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
				},
			}
		);
	} catch (error) {
		console.error("Error fetching pod credits:", error);
		return serverError("Failed to fetch pod credits", error);
	}
}

