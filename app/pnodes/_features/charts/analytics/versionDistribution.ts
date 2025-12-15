import type { PnodeRow } from "@/lib/pnodes/model";
import type { ChartConfig } from "@/components/ui/chart";

export interface VersionDataPoint {
  name: string;
  fullName: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface VersionDistributionResult {
  data: VersionDataPoint[];
  config: ChartConfig;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * Calculate version distribution for pNodes
 */
export function calculateVersionDistribution(
  rows: PnodeRow[]
): VersionDistributionResult {
  const distribution: Record<string, number> = {};
  
  rows.forEach((row) => {
    const version = row.version || "Unknown";
    distribution[version] = (distribution[version] || 0) + 1;
  });

  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

  const config: ChartConfig = {
    count: { label: "Nodes" },
  };

  const data = sorted.map(([version, count], index) => {
    const key = `version_${index}`;
    config[key] = {
      label: version.length > 20 ? version.slice(0, 20) + "..." : version,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return {
      name: key,
      fullName: version,
      count,
      percentage: Math.round((count / rows.length) * 100),
      fill: `var(--color-${key})`,
    };
  });

  return { data, config };
}

