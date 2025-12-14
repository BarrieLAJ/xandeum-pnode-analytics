"use client";

import { useState, useMemo } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	ScatterChart,
	Scatter,
	CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PnodeRow } from "@/lib/pnodes/model";
import { BarChart3, PieChartIcon, Activity, Zap } from "lucide-react";

interface PerformanceChartsProps {
	rows: PnodeRow[];
	modalVersion: string | null;
}

// Chart colors matching the theme
const COLORS = [
	"hsl(var(--chart-1))",
	"hsl(var(--chart-2))",
	"hsl(var(--chart-3))",
	"hsl(var(--chart-4))",
	"hsl(var(--chart-5))",
];

export function PerformanceCharts({
	rows,
	modalVersion,
}: PerformanceChartsProps) {
	const [activeTab, setActiveTab] = useState("version");

	// Version distribution data
	const versionData = useMemo(() => {
		const distribution: Record<string, number> = {};
		rows.forEach((row) => {
			const version = row.version || "Unknown";
			distribution[version] = (distribution[version] || 0) + 1;
		});

		return Object.entries(distribution)
			.map(([name, value]) => ({
				name: name.length > 15 ? name.slice(0, 15) + "..." : name,
				fullName: name,
				value,
				percentage: Math.round((value / rows.length) * 100),
			}))
			.sort((a, b) => b.value - a.value);
	}, [rows]);

	// Endpoint completeness distribution
	const endpointData = useMemo(() => {
		const distribution: Record<number, number> = {};
		rows.forEach((row) => {
			const count = row.derived.endpointCount;
			distribution[count] = (distribution[count] || 0) + 1;
		});

		return Object.entries(distribution)
			.map(([count, value]) => ({
				name: `${count}/10`,
				endpoints: parseInt(count),
				count: value,
			}))
			.sort((a, b) => a.endpoints - b.endpoints);
	}, [rows]);

	// RPC availability data
	const rpcData = useMemo(() => {
		const withRpc = rows.filter((r) => r.derived.hasRpc).length;
		const withoutRpc = rows.length - withRpc;

		return [
			{ name: "Has RPC", value: withRpc, color: COLORS[1] },
			{ name: "No RPC", value: withoutRpc, color: COLORS[4] },
		];
	}, [rows]);

	// Latency distribution (if probed)
	const latencyData = useMemo(() => {
		const probedRows = rows.filter(
			(r) => r.probe?.rpcReachable && r.probe.latencyMs
		);

		if (probedRows.length === 0) return null;

		// Create histogram buckets
		const buckets = [
			{ min: 0, max: 50, label: "0-50ms" },
			{ min: 50, max: 100, label: "50-100ms" },
			{ min: 100, max: 200, label: "100-200ms" },
			{ min: 200, max: 500, label: "200-500ms" },
			{ min: 500, max: 1000, label: "500ms-1s" },
			{ min: 1000, max: Infinity, label: ">1s" },
		];

		return buckets.map((bucket) => ({
			name: bucket.label,
			count: probedRows.filter(
				(r) => r.probe!.latencyMs! >= bucket.min && r.probe!.latencyMs! < bucket.max
			).length,
		}));
	}, [rows]);

	// Scatter plot data for latency vs endpoint count
	const scatterData = useMemo(() => {
		return rows
			.filter((r) => r.probe?.rpcReachable && r.probe.latencyMs)
			.map((r) => ({
				x: r.derived.endpointCount,
				y: r.probe!.latencyMs!,
				pubkey: r.derived.shortPubkey,
				version: r.version,
			}));
	}, [rows]);

	const hasProbeData = rows.some((r) => r.probe);

	return (
		<Card className="animate-fade-in">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-primary" />
					Network Analytics
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4 mb-6">
						<TabsTrigger value="version" className="gap-1.5">
							<PieChartIcon className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Versions</span>
						</TabsTrigger>
						<TabsTrigger value="endpoints" className="gap-1.5">
							<BarChart3 className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Endpoints</span>
						</TabsTrigger>
						<TabsTrigger value="rpc" className="gap-1.5">
							<Activity className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">RPC</span>
						</TabsTrigger>
						<TabsTrigger value="latency" className="gap-1.5" disabled={!hasProbeData}>
							<Zap className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Latency</span>
						</TabsTrigger>
					</TabsList>

					{/* Version Distribution */}
					<TabsContent value="version" className="space-y-4">
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Software version distribution across {rows.length} pNodes
							</p>
							{modalVersion && (
								<Badge variant="outline" className="gap-1.5">
									Modal: {modalVersion}
								</Badge>
							)}
						</div>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={versionData}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, payload }) => {
											const pct = payload?.percentage;
											return pct && pct > 5 ? `${name} (${pct}%)` : "";
										}}
										outerRadius={100}
										fill="#8884d8"
										dataKey="value"
									>
										{versionData.map((_, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												return (
													<div className="rounded-lg border bg-background p-2 shadow-md">
														<p className="font-medium">{data.fullName}</p>
														<p className="text-sm text-muted-foreground">
															{data.value} nodes ({data.percentage}%)
														</p>
													</div>
												);
											}
											return null;
										}}
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</TabsContent>

					{/* Endpoint Completeness */}
					<TabsContent value="endpoints" className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Number of advertised endpoints per pNode (out of 10 possible)
						</p>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={endpointData}>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis
										dataKey="name"
										stroke="hsl(var(--muted-foreground))"
										fontSize={12}
									/>
									<YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												return (
													<div className="rounded-lg border bg-background p-2 shadow-md">
														<p className="font-medium">{data.endpoints} endpoints</p>
														<p className="text-sm text-muted-foreground">
															{data.count} nodes
														</p>
													</div>
												);
											}
											return null;
										}}
									/>
									<Bar
										dataKey="count"
										fill="hsl(var(--primary))"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</TabsContent>

					{/* RPC Availability */}
					<TabsContent value="rpc" className="space-y-4">
						<p className="text-sm text-muted-foreground">
							RPC endpoint availability across the network
						</p>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={rpcData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={100}
										fill="#8884d8"
										paddingAngle={5}
										dataKey="value"
										label={({ name, value }) => `${name}: ${value}`}
									>
										{rpcData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												return (
													<div className="rounded-lg border bg-background p-2 shadow-md">
														<p className="font-medium">{data.name}</p>
														<p className="text-sm text-muted-foreground">
															{data.value} nodes (
															{Math.round((data.value / rows.length) * 100)}%)
														</p>
													</div>
												);
											}
											return null;
										}}
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</TabsContent>

					{/* Latency Distribution */}
					<TabsContent value="latency" className="space-y-4">
						{!hasProbeData ? (
							<div className="text-center py-12 text-muted-foreground">
								<Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
								<p className="text-sm">Run RPC probes to see latency distribution</p>
								<p className="text-xs mt-2 opacity-70">
									Click &quot;Test RPC Health&quot; in the directory
								</p>
							</div>
						) : (
							<>
								<p className="text-sm text-muted-foreground">
									RPC response latency distribution
								</p>

								{latencyData && (
									<div className="h-[250px]">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={latencyData}>
												<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
												<XAxis
													dataKey="name"
													stroke="hsl(var(--muted-foreground))"
													fontSize={12}
												/>
												<YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
												<Tooltip
													content={({ active, payload }) => {
														if (active && payload && payload.length) {
															const data = payload[0].payload;
															return (
																<div className="rounded-lg border bg-background p-2 shadow-md">
																	<p className="font-medium">{data.name}</p>
																	<p className="text-sm text-muted-foreground">
																		{data.count} nodes
																	</p>
																</div>
															);
														}
														return null;
													}}
												/>
												<Bar
													dataKey="count"
													fill="hsl(var(--chart-2))"
													radius={[4, 4, 0, 0]}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
								)}

								{scatterData.length > 0 && (
									<>
										<p className="text-sm text-muted-foreground mt-6">
											Latency vs Endpoint Count
										</p>
										<div className="h-[250px]">
											<ResponsiveContainer width="100%" height="100%">
												<ScatterChart>
													<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
													<XAxis
														dataKey="x"
														name="Endpoints"
														stroke="hsl(var(--muted-foreground))"
														fontSize={12}
														label={{
															value: "Endpoints",
															position: "bottom",
															fontSize: 12,
														}}
													/>
													<YAxis
														dataKey="y"
														name="Latency (ms)"
														stroke="hsl(var(--muted-foreground))"
														fontSize={12}
														label={{
															value: "Latency (ms)",
															angle: -90,
															position: "insideLeft",
															fontSize: 12,
														}}
													/>
													<Tooltip
														content={({ active, payload }) => {
															if (active && payload && payload.length) {
																const data = payload[0].payload;
																return (
																	<div className="rounded-lg border bg-background p-2 shadow-md">
																		<p className="font-medium font-mono">{data.pubkey}</p>
																		<p className="text-sm text-muted-foreground">
																			Latency: {data.y}ms
																		</p>
																		<p className="text-sm text-muted-foreground">
																			Endpoints: {data.x}/10
																		</p>
																	</div>
																);
															}
															return null;
														}}
													/>
													<Scatter data={scatterData} fill="hsl(var(--primary))" />
												</ScatterChart>
											</ResponsiveContainer>
										</div>
									</>
								)}
							</>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
