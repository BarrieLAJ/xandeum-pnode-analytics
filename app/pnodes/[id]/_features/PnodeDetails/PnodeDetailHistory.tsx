"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@/lib/query/client";
import { getPodHistory, getPodStatsHistory } from "@/app/pnodes/_features/api";
import { formatBytes } from "@/lib/utils";

type Range = "24h" | "7d" | "30d";

interface PnodeDetailHistoryProps {
	pubkey: string;
}

export function PnodeDetailHistory({ pubkey }: PnodeDetailHistoryProps) {
	const [range, setRange] = useState<Range>("24h");

	const podHistory = useQuery({
		queryKey: ["history", "pod", pubkey, range],
		queryFn: () => getPodHistory(pubkey, range),
		staleTime: 10_000,
		refetchOnWindowFocus: false,
		retry: 1,
	});

	const statsHistory = useQuery({
		queryKey: ["history", "podStats", pubkey, range],
		queryFn: () => getPodStatsHistory(pubkey, range),
		staleTime: 10_000,
		refetchOnWindowFocus: false,
		retry: 1,
	});

	const storagePoints = (podHistory.data?.points ?? [])
		.map((p) => ({
			ts: new Date(p.ts).toLocaleString(),
			used: p.storageUsedBytes ?? 0,
			committed: p.storageCommittedBytes ?? 0,
		}))
		.reverse();

	const cpuPoints = (statsHistory.data?.points ?? [])
		.map((p) => ({
			ts: new Date(p.ts).toLocaleString(),
			cpu: p.cpuPercent ?? null,
		}))
		.reverse();

	const storageConfig = {
		used: { label: "Used", color: "hsl(var(--chart-2))" },
		committed: { label: "Committed", color: "hsl(var(--chart-3))" },
	} as const;

	const cpuConfig = {
		cpu: { label: "CPU %", color: "hsl(var(--chart-1))" },
	} as const;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Historical</h2>
				<Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
					<TabsList>
						<TabsTrigger value="24h">24h</TabsTrigger>
						<TabsTrigger value="7d">7d</TabsTrigger>
						<TabsTrigger value="30d">30d</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Storage Used vs Committed</CardTitle>
					</CardHeader>
					<CardContent>
						{podHistory.isLoading ? (
							<div className="text-sm text-muted-foreground">Loading…</div>
						) : podHistory.error ? (
							<div className="text-sm text-muted-foreground">
								History unavailable: {podHistory.error.message}
							</div>
						) : (
							<ChartContainer
								config={storageConfig}
								className="h-[200px] sm:h-[240px] lg:h-[260px] w-full"
							>
								<LineChart data={storagePoints} accessibilityLayer>
									<CartesianGrid vertical={false} />
									<XAxis dataKey="ts" hide />
									<YAxis
										tickLine={false}
										axisLine={false}
										tickFormatter={(v) => formatBytes(v)}
									/>
									<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									<Line
										type="monotone"
										dataKey="committed"
										stroke="var(--color-committed)"
										strokeWidth={2}
										dot={false}
									/>
									<Line
										type="monotone"
										dataKey="used"
										stroke="var(--color-used)"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ChartContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">CPU % (sampled)</CardTitle>
					</CardHeader>
					<CardContent>
						{statsHistory.isLoading ? (
							<div className="text-sm text-muted-foreground">Loading…</div>
						) : statsHistory.error ? (
							<div className="text-sm text-muted-foreground">
								Stats history unavailable: {statsHistory.error.message}
							</div>
						) : cpuPoints.length === 0 ? (
							<div className="text-sm text-muted-foreground">
								No CPU samples yet. (We’ll start recording samples when you view a
								node’s live stats, or via an optional poller.)
							</div>
						) : (
							<ChartContainer
								config={cpuConfig}
								className="h-[200px] sm:h-[240px] lg:h-[260px] w-full"
							>
								<LineChart data={cpuPoints} accessibilityLayer>
									<CartesianGrid vertical={false} />
									<XAxis dataKey="ts" hide />
									<YAxis tickLine={false} axisLine={false} unit="%" />
									<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									<Line
										type="monotone"
										dataKey="cpu"
										stroke="var(--color-cpu)"
										strokeWidth={2}
										dot={false}
										connectNulls
									/>
								</LineChart>
							</ChartContainer>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
