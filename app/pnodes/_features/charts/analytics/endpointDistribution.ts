import type { PnodeRow } from "@/lib/pnodes/model";
import type { ChartConfig } from "@/components/ui/chart";

export interface EndpointDataPoint {
  name: string;
  endpoints: number;
  count: number;
}

export interface EndpointDistributionResult {
  data: EndpointDataPoint[];
  config: ChartConfig;
}

/**
 * Calculate endpoint completeness distribution for pNodes
 */
export function calculateEndpointDistribution(
  rows: PnodeRow[]
): EndpointDistributionResult {
  const distribution: Record<number, number> = {};
  
  rows.forEach((row) => {
    const count = row.derived.endpointCount;
    distribution[count] = (distribution[count] || 0) + 1;
  });

  const config: ChartConfig = {
    count: {
      label: "Nodes",
      color: "var(--chart-1)",
    },
  };

  const data = Object.entries(distribution)
    .map(([count, value]) => ({
      name: `${count} endpoint${parseInt(count) !== 1 ? 's' : ''}`,
      endpoints: parseInt(count),
      count: value,
    }))
    .sort((a, b) => a.endpoints - b.endpoints);

  return { data, config };
}

