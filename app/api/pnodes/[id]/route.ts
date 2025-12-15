import { NextResponse } from "next/server";
import { getPnodeById, getSnapshot } from "@/lib/pnodes/service";
import { badRequest, notFound, serverError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/pnodes/[id]
 *
 * Returns detailed information about a specific pNode by pubkey.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: pubkey } = await params;

    if (!pubkey) {
      return badRequest("Missing pubkey parameter");
    }

    // Get the specific node
    const node = await getPnodeById(pubkey);

    if (!node) {
      return notFound("pNode not found", undefined, { pubkey });
    }

    // Get snapshot for context (stats, modal version, etc.)
    const snapshot = await getSnapshot();

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        node,
        context: {
          totalNodes: snapshot.stats.totalNodes,
          modalVersion: snapshot.stats.modalVersion,
          isOnModalVersion: node.version === snapshot.stats.modalVersion,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pNode details:", error);
    return serverError("Failed to fetch pNode details", error);
  }
}

