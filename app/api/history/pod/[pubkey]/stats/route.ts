import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { badRequest, serverError } from "@/lib/api/errors";
import { getPodStatsHistory, type HistoryRange } from "@/lib/db/queries";

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
 * GET /api/history/pod/[pubkey]/stats?range=24h|7d|30d
 *
 * Returns sampled `get stats` time-series for a single pod (if collected).
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    if (!env.DATABASE_URL) {
      return badRequest("DATABASE_URL_MISSING", "Historical data is not configured");
    }

    const { pubkey } = await params;
    if (!pubkey) {
      return badRequest("MISSING_PUBKEY", "Missing pubkey parameter");
    }

    const { searchParams } = new URL(request.url);
    const range = parseRange(searchParams.get("range"));

    const rows = await getPodStatsHistory(pubkey, range);

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
    console.error("Error fetching pod stats history:", error);
    return serverError("Failed to fetch pod stats history", error);
  }
}


