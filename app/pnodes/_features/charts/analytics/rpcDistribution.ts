import type { PnodeRow } from "@/lib/pnodes/model";
import type { ChartConfig } from "@/components/ui/chart";

export interface RpcDataPoint {
  name: string;
  value: number;
  fill: string;
}

export interface RpcDistributionResult {
  data: RpcDataPoint[];
  config: ChartConfig;
  withRpc: number;
  withoutRpc: number;
}

/**
 * Calculate RPC availability distribution for pNodes
 */
export function calculateRpcDistribution(
  rows: PnodeRow[]
): RpcDistributionResult {
  const withRpc = rows.filter((r) => r.derived.hasRpc).length;
  const withoutRpc = rows.length - withRpc;

  const config: ChartConfig = {
    value: { label: "Nodes" },
    hasRpc: {
      label: "Has RPC",
      color: "var(--chart-2)",
    },
    noRpc: {
      label: "No RPC",
      color: "var(--chart-5)",
    },
  };

  const data = [
    { name: "hasRpc", value: withRpc, fill: "var(--color-hasRpc)" },
    { name: "noRpc", value: withoutRpc, fill: "var(--color-noRpc)" },
  ];

  return { data, config, withRpc, withoutRpc };
}

