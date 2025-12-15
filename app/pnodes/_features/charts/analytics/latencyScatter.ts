import type { PnodeRow } from "@/lib/pnodes/model";
import type { ChartConfig } from "@/components/ui/chart";

export interface ScatterDataPoint {
  x: number;
  y: number;
  pubkey: string;
  version: string | null;
}

export interface LatencyScatterResult {
  data: ScatterDataPoint[];
  config: ChartConfig;
}

/**
 * Generate scatter plot data for latency vs endpoint count
 */
export function calculateLatencyScatter(
  rows: PnodeRow[]
): LatencyScatterResult {
  const config: ChartConfig = {
    latency: {
      label: "Latency (ms)",
      color: "var(--chart-1)",
    },
  };

  const data = rows
    .filter((r) => r.probe?.rpcReachable && r.probe.latencyMs)
    .map((r) => ({
      x: r.derived.endpointCount,
      y: r.probe!.latencyMs!,
      pubkey: r.derived.shortPubkey,
      version: r.version,
    }));

  return { data, config };
}

