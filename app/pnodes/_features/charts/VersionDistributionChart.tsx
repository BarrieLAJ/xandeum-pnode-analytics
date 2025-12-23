"use client";

import { PieChart, Pie, Label } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";
import { calculateVersionDistribution } from "@/app/pnodes/_features/charts/analytics";
import type { PnodeRow } from "@/lib/pnodes/model";

interface VersionDistributionChartProps {
	rows: PnodeRow[];
	modalVersion: string | null;
}

export function VersionDistributionChart({
	rows,
	modalVersion,
}: VersionDistributionChartProps) {
	const { data: versionData, config: versionConfig } =
		calculateVersionDistribution(rows);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Software version distribution across {rows.length} pNodes. Network health depends on nodes running compatible versions.
				</p>
				{modalVersion && (
					<Badge variant="outline" className="gap-1.5">
						Modal: {modalVersion}
					</Badge>
				)}
			</div>
			<ChartContainer
				config={versionConfig}
				className="mx-auto aspect-square max-h-[240px] sm:max-h-[280px] lg:max-h-[300px] w-full"
			>
				<PieChart>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								formatter={(value, name, item) => (
									<div className="flex flex-col gap-0.5">
										<span className="font-medium">{item.payload.fullName}</span>
										<span className="text-muted-foreground">
											{value} nodes ({item.payload.percentage}%)
										</span>
									</div>
								)}
							/>
						}
					/>
					<Pie
						data={versionData}
						dataKey="count"
						nameKey="name"
						cx="50%"
						cy="50%"
						outerRadius={100}
						strokeWidth={2}
					>
						<Label
							content={({ viewBox }) => {
								if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
												{versionData.length}
											</tspan>
											<tspan
												x={viewBox.cx}
												y={(viewBox.cy || 0) + 20}
												className="fill-muted-foreground text-xs"
											>
												versions
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
						className="flex-wrap gap-2 *:basis-1/4 *:justify-center"
					/>
				</PieChart>
			</ChartContainer>
		</div>
	);
}
