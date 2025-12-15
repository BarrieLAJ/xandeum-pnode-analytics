"use client";

import { useMutation } from "@/lib/query/client";
import { probeNodes } from "../api";
import type { PnodeRow } from "@/lib/pnodes/model";

/**
 * Aggregated probe statistics
 */
export interface ProbeStats {
  reachable: number;
  unreachable: number;
  avgLatencyMs: number | null;
  minLatencyMs: number | null;
  maxLatencyMs: number | null;
}

/**
 * Result of a probe operation
 */
export interface ProbeResult {
  rows: PnodeRow[];
  stats: ProbeStats;
}

/**
 * Hook for probing pNode RPC endpoints
 */
export function usePnodeProbe() {
	return useMutation<ProbeResult, Error, boolean>({
		mutationFn: async (includeUnreachable: boolean) => {
			const response = await probeNodes(includeUnreachable);

      // Calculate stats from probed rows
      const probedRows = response.rows.filter((r) => r.probe);
      const reachable = probedRows.filter((r) => r.probe?.rpcReachable).length;
      const unreachable = probedRows.length - reachable;

      const latencies = probedRows
        .filter((r) => r.probe?.latencyMs)
        .map((r) => r.probe!.latencyMs!);

      const stats: ProbeStats = {
        reachable,
        unreachable,
        avgLatencyMs:
          latencies.length > 0
            ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
            : null,
        minLatencyMs: latencies.length > 0 ? Math.min(...latencies) : null,
        maxLatencyMs: latencies.length > 0 ? Math.max(...latencies) : null,
      };

      return { rows: response.rows, stats };
    },
  });
}

