import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { serverError } from "@/lib/api/errors";
import { authorizeCronRequest } from "../_services/auth";
import { ingestSnapshot } from "../_services/ingest";

export const dynamic = "force-dynamic";
export const revalidate = 0;
// Give the cron enough time for DB writes (stats run in `after()`).
export const maxDuration = 60;

/**
 * GET /api/cron/ingest-snapshot
 *
 * Periodically persists network + per-pod snapshots for historical charts.
 * Protected by `CRON_SECRET` via Authorization header (Bearer token).
 * Vercel automatically includes this header in cron job invocations.
 */
export async function GET(request: Request) {
	try {
		if (!authorizeCronRequest(request)) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (!env.DATABASE_URL) {
			return serverError("DATABASE_URL is not configured");
		}

		const result = await ingestSnapshot();

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error ingesting snapshot:", error);
		return serverError("Failed to ingest snapshot", error);
	}
}
