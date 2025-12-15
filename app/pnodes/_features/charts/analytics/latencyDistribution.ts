import type { PnodeRow } from "@/lib/pnodes/model";
import type { ChartConfig } from "@/components/ui/chart";

export interface LatencyDataPoint {
  name: string;
  count: number;
}

export interface LatencyDistributionResult {
  data: LatencyDataPoint[] | null;
  config: ChartConfig;
}

const LATENCY_BUCKETS = [
  { min: 0, max: 50, label: "0-50ms" },
  { min: 50, max: 100, label: "50-100ms" },
  { min: 100, max: 200, label: "100-200ms" },
  { min: 200, max: 500, label: "200-500ms" },
  { min: 500, max: 1000, label: "500ms-1s" },
  { min: 1000, max: Infinity, label: ">1s" },
];

/**
 * Calculate latency distribution from probed pNodes
 */
export function calculateLatencyDistribution(
  rows: PnodeRow[]
): LatencyDistributionResult {
  const config: ChartConfig = {
    count: {
      label: "Nodes",
      color: "var(--chart-2)",
    },
  };

  const probedRows = rows.filter(
    (r) => r.probe?.rpcReachable && r.probe.latencyMs
  );

  if (probedRows.length === 0) {
    return { data: null, config };
  }

  const data = LATENCY_BUCKETS.map((bucket) => ({
    name: bucket.label,
    count: probedRows.filter(
      (r) => r.probe!.latencyMs! >= bucket.min && r.probe!.latencyMs! < bucket.max
    ).length,
  }));

  return { data, config };
}

