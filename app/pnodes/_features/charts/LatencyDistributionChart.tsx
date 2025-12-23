"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { calculateLatencyDistribution } from "@/app/pnodes/_features/charts/analytics";
import { Zap } from "lucide-react";
import type { PnodeRow } from "@/lib/pnodes/model";
import { LatencyScatterChart } from "./LatencyScatterChart";

interface LatencyDistributionChartProps {
	rows: PnodeRow[];
}

export function LatencyDistributionChart({
	rows,
}: LatencyDistributionChartProps) {
	const hasProbeData = rows.some((r) => r.probe);
	const { data: latencyData, config: latencyConfig } =
		calculateLatencyDistribution(rows);

	if (!hasProbeData) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
				<p className="text-sm">Run RPC probes to see latency distribution</p>
				<p className="text-xs mt-2 opacity-70">
					Click &quot;Test RPC Health&quot; in the directory
				</p>
			</div>
		);
	}

	return (
		<>
			<p className="text-sm text-muted-foreground">
				RPC response latency distribution
			</p>

			{latencyData && (
				<ChartContainer config={latencyConfig} className="h-[200px] sm:h-[230px] lg:h-[250px] w-full">
					<BarChart data={latencyData} accessibilityLayer>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
						<YAxis tickLine={false} axisLine={false} />
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									formatter={(value, name, item) => (
										<div className="flex flex-col gap-0.5">
											<span className="font-medium">{item.payload.name}</span>
											<span className="text-muted-foreground">{value} nodes</span>
										</div>
									)}
								/>
							}
						/>
						<Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			)}

			<LatencyScatterChart rows={rows} />
		</>
	);
}
