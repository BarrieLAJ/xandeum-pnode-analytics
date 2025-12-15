"use client";

import { ScatterChart, Scatter, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { calculateLatencyScatter } from "@/app/pnodes/_features/charts/analytics";
import type { PnodeRow } from "@/lib/pnodes/model";

interface LatencyScatterChartProps {
	rows: PnodeRow[];
}

export function LatencyScatterChart({ rows }: LatencyScatterChartProps) {
	const { data: scatterData, config: scatterConfig } =
		calculateLatencyScatter(rows);

	if (scatterData.length === 0) return null;

	return (
		<>
			<p className="text-sm text-muted-foreground mt-6">
				Latency vs Endpoint Count
			</p>
			<ChartContainer config={scatterConfig} className="h-[250px]">
				<ScatterChart accessibilityLayer>
					<CartesianGrid />
					<XAxis
						dataKey="x"
						name="Endpoints"
						type="number"
						tickLine={false}
						axisLine={false}
						label={{
							value: "Endpoints",
							position: "bottom",
							offset: -5,
						}}
					/>
					<YAxis
						dataKey="y"
						name="Latency (ms)"
						type="number"
						tickLine={false}
						axisLine={false}
						label={{
							value: "Latency (ms)",
							angle: -90,
							position: "insideLeft",
						}}
					/>
					<ChartTooltip
						cursor={{ strokeDasharray: "3 3" }}
						content={
							<ChartTooltipContent
								formatter={(value, name, item) => (
									<div className="flex flex-col gap-0.5">
										<span className="font-medium font-mono">{item.payload.pubkey}</span>
										<span className="text-muted-foreground">
											Latency: {item.payload.y}ms
										</span>
										<span className="text-muted-foreground">
											Endpoints: {item.payload.x}/10
										</span>
									</div>
								)}
							/>
						}
					/>
					<Scatter data={scatterData} fill="var(--color-latency)" />
				</ScatterChart>
			</ChartContainer>
		</>
	);
}
