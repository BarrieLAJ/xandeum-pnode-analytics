"use client";

import { useState } from "react";
import { SnapshotResponse } from "@/lib/pnodes/model";
import { cn } from "@/lib/utils";
import { PnodeTable } from "./PnodeTable";
import { PerformanceCharts } from "./charts/PerformanceCharts";
import { NetworkHistoryCard } from "./charts/NetworkHistoryCard";
import { PnodeDirectoryAlerts } from "./PnodeDirectoryAlerts";
import { PnodeDirectoryKpis } from "./PnodeDirectoryKpis";
import { PnodeDirectoryHeader } from "./PnodeDirectoryHeader";
import { GeoVisualization } from "./GeoVisualization";
import { useWatchlist } from "./hooks/useWatchlist";
import { AutoSize } from "./AutoSize";

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
					<div
						className={cn(
							"grid grid-cols-1 xl:grid-cols-[2.5fr_1fr] gap-6",
							className
						)}
					>
						{/* Table - Left side on desktop, top on mobile - Sticky with filters, table, and pagination */}
						<div
							className="min-w-0 flex flex-col xl:sticky xl:top-16 xl:z-40 xl:h-[calc(100vh-4rem)] xl:overflow-hidden"
							style={{
								height: height ? `${height}px` : undefined,
								maxHeight: height ? `${height}px` : undefined,
							}}
						>
							<PnodeTable
								rows={snapshot.rows}
								modalVersion={snapshot.stats.modalVersion}
								versions={versions}
								watchlist={watchlist}
								onToggleWatchlist={toggleWatchlist}
								showWatchlistFilter={true}
								containerHeight={height}
							/>
						</div>

						{/* Charts - Right side on desktop, bottom on mobile - Scrolls naturally with page */}
						<div className="space-y-6 min-w-0">
							<PerformanceCharts
								rows={snapshot.rows}
								modalVersion={snapshot.stats.modalVersion}
							/>
							<NetworkHistoryCard />
							<GeoVisualization />
						</div>
					</div>
				)}
			</AutoSize>
		</div>
	);
}
