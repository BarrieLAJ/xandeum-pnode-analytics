"use client";

import { useState } from "react";
import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Database,
	Timer,
	Coins,
	Cpu,
	MemoryStick,
	Network,
	Radio,
} from "lucide-react";
import { PnodeDetailSystemStats } from "./PnodeDetailSystemStats";
import {
	formatBytes,
	formatDurationSeconds,
	formatDate,
	aggregateTimeSeriesData,
} from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@/lib/query/client";
import { getPodStatsHistory } from "@/app/pnodes/_features/api";

type Range = "24h" | "7d" | "30d";

interface PnodeDetailOverviewProps {
	node: PnodeRow;
	snapshot: SnapshotResponse;
}

export function PnodeDetailOverview({ node }: PnodeDetailOverviewProps) {
	const [range, setRange] = useState<Range>("24h");

	const statsHistory = useQuery({
		queryKey: ["history", "podStats", node.pubkey, range],
		queryFn: () => getPodStatsHistory(node.pubkey, range),
		staleTime: 10_000,
		refetchOnWindowFocus: false,
		retry: 1,
	});

	const normalizeTimestamp = (ts: unknown): string => {
		if (ts instanceof Date) {
			return ts.toISOString();
		} else if (typeof ts === "string") {
			return ts;
		} else {
			return new Date(ts as string | number).toISOString();
		}
	};

	const rawCpuPoints = (statsHistory.data?.points ?? [])
		.map((p) => ({
			ts: normalizeTimestamp(p.ts),
			cpu: p.cpuPercent ?? null,
		}))
		.reverse();

	const rawRamPoints = (statsHistory.data?.points ?? [])
		.map((p) => ({
			ts: normalizeTimestamp(p.ts),
			ramUsed: p.ramUsedBytes ?? null,
			ramTotal: p.ramTotalBytes ?? null,
			ramPercent:
				p.ramTotalBytes && p.ramUsedBytes
					? (p.ramUsedBytes / p.ramTotalBytes) * 100
					: null,
		}))
		.reverse();

	const rawNetworkPoints = (statsHistory.data?.points ?? [])
		.map((p) => ({
			ts: normalizeTimestamp(p.ts),
			packetsReceived: p.packetsReceived ?? null,
			packetsSent: p.packetsSent ?? null,
		}))
		.reverse();

	const rawStreamsPoints = (statsHistory.data?.points ?? [])
		.map((p) => ({
			ts: normalizeTimestamp(p.ts),
			activeStreams: p.activeStreams ?? null,
		}))
		.reverse();

	// Aggregate data points based on time range to avoid cluttering
	const cpuPoints = aggregateTimeSeriesData(rawCpuPoints, range);
	const ramPoints = aggregateTimeSeriesData(rawRamPoints, range);
	const networkPoints = aggregateTimeSeriesData(rawNetworkPoints, range);
	const streamsPoints = aggregateTimeSeriesData(rawStreamsPoints, range);

	const cpuConfig = {
		cpu: { label: "CPU %", color: "var(--chart-1)" },
	} as const;

	const ramConfig = {
		ramPercent: { label: "RAM %", color: "var(--chart-2)" },
		ramUsed: { label: "RAM Used", color: "var(--chart-3)" },
	} as const;

	const networkConfig = {
		packetsReceived: { label: "Packets Received", color: "var(--chart-1)" },
		packetsSent: { label: "Packets Sent", color: "var(--chart-2)" },
	} as const;

	const streamsConfig = {
		activeStreams: { label: "Active Streams", color: "var(--chart-3)" },
	} as const;

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Database className="h-4 w-4" />
							Storage
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold font-mono">
							{formatBytes(node.pod?.storageUsedBytes)}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Committed: {formatBytes(node.pod?.storageCommittedBytes)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Timer className="h-4 w-4" />
							Uptime
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold font-mono">
							{formatDurationSeconds(node.pod?.uptimeSeconds)}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{node.pod?.lastSeenTimestamp
								? `Last seen: ${formatDate(node.pod.lastSeenTimestamp * 1000)}`
								: "Last seen: —"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Coins className="h-4 w-4" />
							Credits
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold font-mono">
							{node.pod?.credits !== undefined && node.pod.credits !== null
								? node.pod.credits.toLocaleString()
								: "—"}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{node.pod?.credits !== undefined && node.pod.credits !== null
								? "Available credits"
								: "Credits data unavailable"}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Live (on-demand) pRPC stats */}
			<PnodeDetailSystemStats pubkey={node.pubkey} />

			{/* CPU and RAM Usage Graphs */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">System Resource Usage</h2>
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
							<CardTitle className="text-base flex items-center gap-2">
								<Cpu className="h-4 w-4" />
								CPU Usage Over Time
							</CardTitle>
						</CardHeader>
						<CardContent>
							{statsHistory.isLoading ? (
								<div className="text-sm text-muted-foreground">Loading…</div>
							) : statsHistory.error ? (
								<div className="text-sm text-muted-foreground">
									CPU history unavailable: {statsHistory.error.message}
								</div>
							) : cpuPoints.length === 0 ? (
								<div className="text-sm text-muted-foreground">
									No CPU samples yet. Stats will be recorded when you view this
									node&apos;s live stats.
								</div>
							) : (
								<ChartContainer
									config={cpuConfig}
									className="h-[200px] sm:h-[240px] lg:h-[260px] w-full"
								>
									<AreaChart data={cpuPoints} accessibilityLayer>
										<defs>
											<linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="var(--color-cpu)" stopOpacity={0.3} />
												<stop offset="100%" stopColor="var(--color-cpu)" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="ts"
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => {
												if (!value) return "";
												const date = value instanceof Date ? value : new Date(value);
												if (isNaN(date.getTime())) return "";
												if (range === "24h") {
													return date.toLocaleTimeString("en-US", {
														hour: "numeric",
														minute: "2-digit",
													});
												} else if (range === "7d") {
													return date.toLocaleDateString("en-US", {
														weekday: "short",
														month: "short",
														day: "numeric",
													});
												} else {
													return date.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													});
												}
											}}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis tickLine={false} axisLine={false} unit="%" />
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
										<Area
											type="monotone"
											dataKey="cpu"
											stroke="var(--color-cpu)"
											fill="url(#cpuGradient)"
											strokeWidth={2}
											dot={false}
											connectNulls
										/>
									</AreaChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<MemoryStick className="h-4 w-4" />
								RAM Usage Over Time
							</CardTitle>
						</CardHeader>
						<CardContent>
							{statsHistory.isLoading ? (
								<div className="text-sm text-muted-foreground">Loading…</div>
							) : statsHistory.error ? (
								<div className="text-sm text-muted-foreground">
									RAM history unavailable: {statsHistory.error.message}
								</div>
							) : ramPoints.length === 0 ? (
								<div className="text-sm text-muted-foreground">
									No RAM samples yet. Stats will be recorded when you view this
									node&apos;s live stats.
								</div>
							) : (
								<ChartContainer
									config={ramConfig}
									className="h-[200px] sm:h-[240px] lg:h-[260px] w-full"
								>
									<AreaChart data={ramPoints} accessibilityLayer>
										<defs>
											<linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
												<stop
													offset="0%"
													stopColor="var(--color-ramPercent)"
													stopOpacity={0.3}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-ramPercent)"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="ts"
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => {
												if (!value) return "";
												const date = value instanceof Date ? value : new Date(value);
												if (isNaN(date.getTime())) return "";
												if (range === "24h") {
													return date.toLocaleTimeString("en-US", {
														hour: "numeric",
														minute: "2-digit",
													});
												} else if (range === "7d") {
													return date.toLocaleDateString("en-US", {
														weekday: "short",
														month: "short",
														day: "numeric",
													});
												} else {
													return date.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													});
												}
											}}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											tickFormatter={(v) => `${v.toFixed(1)}%`}
										/>
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
										<Area
											type="monotone"
											dataKey="ramPercent"
											stroke="var(--color-ramPercent)"
											fill="url(#ramGradient)"
											strokeWidth={2}
											dot={false}
											connectNulls
										/>
									</AreaChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Network Activity Charts */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Network Activity</h2>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Network className="h-4 w-4" />
								Network Packets
							</CardTitle>
						</CardHeader>
						<CardContent>
							{statsHistory.isLoading ? (
								<div className="text-sm text-muted-foreground">Loading…</div>
							) : statsHistory.error ? (
								<div className="text-sm text-muted-foreground">
									Network history unavailable: {statsHistory.error.message}
								</div>
							) : networkPoints.length === 0 ? (
								<div className="text-sm text-muted-foreground">
									No network data yet. Stats will be recorded when you view this
									node&apos;s live stats.
								</div>
							) : (
								<ChartContainer
									config={networkConfig}
									className="h-[200px] sm:h-[240px] lg:h-[260px] w-full"
								>
									<AreaChart data={networkPoints} accessibilityLayer>
										<defs>
											<linearGradient
												id="packetsReceivedGradient"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="0%"
													stopColor="var(--color-packetsReceived)"
													stopOpacity={0.3}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-packetsReceived)"
													stopOpacity={0}
												/>
											</linearGradient>
											<linearGradient id="packetsSentGradient" x1="0" y1="0" x2="0" y2="1">
												<stop
													offset="0%"
													stopColor="var(--color-packetsSent)"
													stopOpacity={0.3}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-packetsSent)"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="ts"
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => {
												if (!value) return "";
												const date = value instanceof Date ? value : new Date(value);
												if (isNaN(date.getTime())) return "";
												if (range === "24h") {
													return date.toLocaleTimeString("en-US", {
														hour: "numeric",
														minute: "2-digit",
													});
												} else if (range === "7d") {
													return date.toLocaleDateString("en-US", {
														weekday: "short",
														month: "short",
														day: "numeric",
													});
												} else {
													return date.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													});
												}
											}}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis tickLine={false} axisLine={false} />
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
										<Area
											type="monotone"
											dataKey="packetsReceived"
											stroke="var(--color-packetsReceived)"
											fill="url(#packetsReceivedGradient)"
											strokeWidth={2}
											dot={false}
											connectNulls
										/>
										<Area
											type="monotone"
											dataKey="packetsSent"
											stroke="var(--color-packetsSent)"
											fill="url(#packetsSentGradient)"
											strokeWidth={2}
											dot={false}
											connectNulls
										/>
									</AreaChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Radio className="h-4 w-4" />
								Active Streams
							</CardTitle>
						</CardHeader>
						<CardContent>
							{statsHistory.isLoading ? (
								<div className="text-sm text-muted-foreground">Loading…</div>
							) : statsHistory.error ? (
								<div className="text-sm text-muted-foreground">
									Streams history unavailable: {statsHistory.error.message}
								</div>
							) : streamsPoints.length === 0 ? (
								<div className="text-sm text-muted-foreground">
									No streams data yet. Stats will be recorded when you view this
									node&apos;s live stats.
								</div>
							) : (
								<ChartContainer
									config={streamsConfig}
									className="h-[200px] sm:h-[240px] lg:h-[260px] w-full"
								>
									<AreaChart data={streamsPoints} accessibilityLayer>
										<defs>
											<linearGradient id="streamsGradient" x1="0" y1="0" x2="0" y2="1">
												<stop
													offset="0%"
													stopColor="var(--color-activeStreams)"
													stopOpacity={0.3}
												/>
												<stop
													offset="100%"
													stopColor="var(--color-activeStreams)"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="ts"
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => {
												if (!value) return "";
												const date = value instanceof Date ? value : new Date(value);
												if (isNaN(date.getTime())) return "";
												if (range === "24h") {
													return date.toLocaleTimeString("en-US", {
														hour: "numeric",
														minute: "2-digit",
													});
												} else if (range === "7d") {
													return date.toLocaleDateString("en-US", {
														weekday: "short",
														month: "short",
														day: "numeric",
													});
												} else {
													return date.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													});
												}
											}}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis tickLine={false} axisLine={false} />
										<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
										<Area
											type="monotone"
											dataKey="activeStreams"
											stroke="var(--color-activeStreams)"
											fill="url(#streamsGradient)"
											strokeWidth={2}
											dot={false}
											connectNulls
										/>
									</AreaChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
