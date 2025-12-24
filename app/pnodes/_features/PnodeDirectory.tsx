"use client";

import { useState } from "react";
import { SnapshotResponse } from "@/lib/pnodes/model";
import { cn } from "@/lib/utils";
import { PnodeCardList } from "./cards";
import { PerformanceCharts } from "./charts/PerformanceCharts";
import { NetworkHistoryCard } from "./charts/NetworkHistoryCard";
import { PnodeDirectoryAlerts } from "./PnodeDirectoryAlerts";
import { PnodeDirectoryKpis } from "./PnodeDirectoryKpis";
import { PnodeDirectoryHeader } from "./PnodeDirectoryHeader";
import { GeoVisualization } from "./GeoVisualization";
import { useWatchlist } from "./hooks/useWatchlist";
import { AutoSize } from "./AutoSize";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Server, BarChart3 } from "lucide-react";

interface PnodeDirectoryProps {
	initialSnapshot: SnapshotResponse;
}

export function PnodeDirectory({ initialSnapshot }: PnodeDirectoryProps) {
	const [snapshot] = useState(initialSnapshot);
	const {
		watchlist,
		toggle: toggleWatchlist,
		count: watchlistCount,
	} = useWatchlist();
	const versions = Object.keys(snapshot.stats.versionDistribution).sort();

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Alerts */}
			<PnodeDirectoryAlerts stale={snapshot.stale} errors={snapshot.errors} />

			{/* KPI Cards */}
			<PnodeDirectoryKpis stats={snapshot.stats} watchlistCount={watchlistCount} />

			{/* Page header */}
			<PnodeDirectoryHeader watchlistCount={watchlistCount} />

			{/* Main Content: Table (left) and Charts (right) */}
			<AutoSize>
				{({ height, className }) => (
					<>
						{/* Mobile: Tabbed interface */}
						<div className="xl:hidden">
							<Tabs defaultValue="nodes" className="w-full">
								<TabsList className="w-full justify-start mb-4">
									<TabsTrigger value="nodes" className="flex items-center gap-2">
										<Server className="h-4 w-4" />
										Nodes
									</TabsTrigger>
									<TabsTrigger value="analytics" className="flex items-center gap-2">
										<BarChart3 className="h-4 w-4" />
										Analytics
									</TabsTrigger>
								</TabsList>
								<TabsContent value="nodes" className="mt-0">
									<PnodeCardList
										rows={snapshot.rows}
										modalVersion={snapshot.stats.modalVersion}
										versions={versions}
										watchlist={watchlist}
										onToggleWatchlist={toggleWatchlist}
										showWatchlistFilter={true}
									/>
								</TabsContent>
								<TabsContent value="analytics" className="mt-0 space-y-6">
									<PerformanceCharts
										rows={snapshot.rows}
										modalVersion={snapshot.stats.modalVersion}
									/>
									<NetworkHistoryCard />
									<GeoVisualization />
								</TabsContent>
							</Tabs>
						</div>

						{/* Desktop: Side-by-side layout */}
						<div
							className={cn(
								"hidden xl:grid grid-cols-[2.5fr_1fr] gap-6",
								className
							)}
						>
							{/* Table/Cards - Left side on desktop - Sticky with filters, table, and pagination */}
							<div
								className="min-w-0 flex flex-col sticky top-16 z-40 h-[calc(100vh-4rem)] overflow-hidden"
								style={{
									height: height ? `${height}px` : undefined,
									maxHeight: height ? `${height}px` : undefined,
								}}
							>
								<PnodeCardList
									rows={snapshot.rows}
									modalVersion={snapshot.stats.modalVersion}
									versions={versions}
									watchlist={watchlist}
									onToggleWatchlist={toggleWatchlist}
									showWatchlistFilter={true}
									containerHeight={height}
								/>
							</div>

							{/* Charts - Right side on desktop - Scrolls naturally with page */}
							<div className="space-y-6 min-w-0">
								<PerformanceCharts
									rows={snapshot.rows}
									modalVersion={snapshot.stats.modalVersion}
								/>
								<NetworkHistoryCard />
								<GeoVisualization />
							</div>
						</div>
					</>
				)}
			</AutoSize>
		</div>
	);
}
