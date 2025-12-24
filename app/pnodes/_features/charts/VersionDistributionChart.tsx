"use client";

import { PieChart, Pie, Label } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
} from "@/components/ui/chart";
import { calculateVersionDistribution } from "@/app/pnodes/_features/charts/analytics";
import { truncateVersion } from "@/lib/utils";
import type { PnodeRow } from "@/lib/pnodes/model";
import type { VersionDataPoint } from "@/app/pnodes/_features/charts/analytics";

interface VersionDistributionChartProps {
	rows: PnodeRow[];
	modalVersion: string | null;
}

// Custom legend component that truncates long version strings
function VersionLegend({
	payload,
	versionData,
}: {
	payload:
		| Array<{
				value?: string | number;
				type?: string;
				name?: string;
				color?: string;
				payload?: unknown;
		  }>
		| undefined;
	versionData: VersionDataPoint[];
}) {
	if (!payload?.length) return null;

	// Match payload items with versionData by index (order should match)
	const filteredPayload = payload.filter((item) => item.type !== "none");

	return (
		<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-2">
			{filteredPayload
				.map((item, index) => {
					// Get the corresponding version data by index
					const versionItem = versionData[index];
					const fullVersion = versionItem?.fullName || "";
					const truncatedVersion = truncateVersion(fullVersion, 12);

					// If we don't have a version, skip this item
					if (!fullVersion) {
						return null;
					}

					return (
						<div
							key={item.value ?? item.name ?? index}
							className="flex items-center gap-1.5 min-w-0 flex-shrink-0"
							title={fullVersion} // Show full version on hover
						>
							<div
								className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
								style={{
									backgroundColor: item.color,
								}}
							/>
							<span className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">
								{truncatedVersion}
							</span>
						</div>
					);
				})
				.filter(Boolean)}
		</div>
	);
}

export function VersionDistributionChart({
	rows,
	modalVersion,
}: VersionDistributionChartProps) {
	const { data: versionData, config: versionConfig } =
		calculateVersionDistribution(rows);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<p className="text-sm text-muted-foreground">
					Software version distribution across {rows.length} pNodes. Network health
					depends on nodes running compatible versions.
				</p>
				{modalVersion && (
					<Badge variant="outline" className="gap-1.5 shrink-0">
						Modal: {modalVersion}
					</Badge>
				)}
			</div>
			<div className="flex flex-col items-center">
				<ChartContainer
					config={versionConfig}
					className="mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]"
					style={{ height: "280px" }}
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
							cy="45%"
							outerRadius="70%"
							strokeWidth={2}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={(viewBox.cy || 0) * 0.9}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) * 0.9}
													className="fill-foreground text-2xl font-bold"
												>
													{versionData.length}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) * 0.9 + 20}
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
							verticalAlign="bottom"
							height={60}
							content={({ payload }) => (
								<VersionLegend payload={payload} versionData={versionData} />
							)}
						/>
					</PieChart>
				</ChartContainer>
			</div>
		</div>
	);
}
