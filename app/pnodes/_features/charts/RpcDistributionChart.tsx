"use client";

import { PieChart, Pie, Label } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";
import { calculateRpcDistribution } from "@/app/pnodes/_features/charts/analytics";
import type { PnodeRow } from "@/lib/pnodes/model";

interface RpcDistributionChartProps {
	rows: PnodeRow[];
}

export function RpcDistributionChart({ rows }: RpcDistributionChartProps) {
	const { data: rpcData, config: rpcConfig } = calculateRpcDistribution(rows);
	const totalNodes = rows.length;

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				RPC endpoint availability across the network
			</p>
			<ChartContainer
				config={rpcConfig}
				className="mx-auto aspect-square max-h-[300px]"
			>
				<PieChart>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								nameKey="name"
								formatter={(value) => (
									<span>
										{value} nodes ({Math.round((Number(value) / totalNodes) * 100)}%)
									</span>
								)}
							/>
						}
					/>
					<Pie
						data={rpcData}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={100}
						strokeWidth={2}
						paddingAngle={3}
					>
						<Label
							content={({ viewBox }) => {
								if (viewBox && "cx" in viewBox && "cy" in viewBox) {
									const withRpc = rpcData.find((d) => d.name === "hasRpc")?.value || 0;
									const percent = Math.round((withRpc / totalNodes) * 100);
									return (
										<text
											x={viewBox.cx}
											y={viewBox.cy}
											textAnchor="middle"
											dominantBaseline="middle"
										>
											<tspan
												x={viewBox.cx}
												y={viewBox.cy}
												className="fill-foreground text-2xl font-bold"
											>
												{percent}%
											</tspan>
											<tspan
												x={viewBox.cx}
												y={(viewBox.cy || 0) + 20}
												className="fill-muted-foreground text-xs"
											>
												have RPC
											</tspan>
										</text>
									);
								}
							}}
						/>
					</Pie>
					<ChartLegend
						content={({ payload }) => (
							<ChartLegendContent payload={payload} nameKey="name" />
						)}
					/>
				</PieChart>
			</ChartContainer>
		</div>
	);
}
