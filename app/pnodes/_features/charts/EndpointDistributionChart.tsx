"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { calculateEndpointDistribution } from "@/app/pnodes/_features/charts/analytics";
import type { PnodeRow } from "@/lib/pnodes/model";

interface EndpointDistributionChartProps {
	rows: PnodeRow[];
}

export function EndpointDistributionChart({
	rows,
}: EndpointDistributionChartProps) {
	const { data: endpointData, config: endpointConfig } =
		calculateEndpointDistribution(rows);

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Number of advertised endpoints per pNode (out of 10 possible)
			</p>
			<ChartContainer config={endpointConfig} className="h-[300px]">
				<BarChart data={endpointData} accessibilityLayer>
					<CartesianGrid vertical={false} />
					<XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
					<YAxis tickLine={false} axisLine={false} />
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								formatter={(value, name, item) => (
									<div className="flex flex-col gap-0.5">
										<span className="font-medium">
											{item.payload.endpoints} endpoints
										</span>
										<span className="text-muted-foreground">{value} nodes</span>
									</div>
								)}
							/>
						}
					/>
					<Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ChartContainer>
		</div>
	);
}
