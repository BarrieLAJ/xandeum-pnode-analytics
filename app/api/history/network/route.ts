import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { badRequest, serverError } from "@/lib/api/errors";
import { getNetworkHistory, type HistoryRange } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseRange(value: string | null): HistoryRange {
  if (value === "24h" || value === "7d" || value === "30d") return value;
  return "24h";
}

/**
 * GET /api/history/network?range=24h|7d|30d
 */
export async function GET(request: Request) {
  try {
    if (!env.DATABASE_URL) {
      return badRequest("DATABASE_URL_MISSING", "Historical data is not configured");
    }

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
    return serverError("Failed to fetch network history", error);
  }
}


