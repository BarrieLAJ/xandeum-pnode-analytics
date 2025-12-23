"use client";

import { useState } from "react";
import { SnapshotResponse } from "@/lib/pnodes/model";
import { PnodeTable } from "./PnodeTable";
import { PerformanceCharts } from "./charts/PerformanceCharts";
import { NetworkHistoryCard } from "./charts/NetworkHistoryCard";
import { PnodeDirectoryAlerts } from "./PnodeDirectoryAlerts";
import { PnodeDirectoryKpis } from "./PnodeDirectoryKpis";
import { PnodeDirectoryHeader } from "./PnodeDirectoryHeader";
import { GeoVisualization } from "./GeoVisualization";
import { useWatchlist } from "./hooks/useWatchlist";

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
			<PnodeDirectoryHeader
				sourceMethod={snapshot.source.method}
				watchlistCount={watchlistCount}
			/>

			{/* Main Content: Table (left) and Charts (right) */}
			<div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
				{/* Table - Left side on desktop, top on mobile */}
				<div className="min-w-0">
					<PnodeTable
						rows={snapshot.rows}
						modalVersion={snapshot.stats.modalVersion}
						versions={versions}
						showProbeColumn={false}
						watchlist={watchlist}
						onToggleWatchlist={toggleWatchlist}
						showWatchlistFilter={true}
					/>
				</div>

				{/* Charts - Right side on desktop, bottom on mobile */}
				<div className="space-y-6 min-w-0">
					<PerformanceCharts
						rows={snapshot.rows}
						modalVersion={snapshot.stats.modalVersion}
					/>
					<NetworkHistoryCard />
					<GeoVisualization />
				</div>
			</div>
		</div>
	);
}
