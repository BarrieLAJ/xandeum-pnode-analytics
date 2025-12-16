"use client";

import { useState } from "react";
import { SnapshotResponse } from "@/lib/pnodes/model";
import { PnodeTable } from "./PnodeTable";
import { PerformanceCharts } from "./charts/PerformanceCharts";
import { NetworkHistoryCard } from "./charts/NetworkHistoryCard";
import { PnodeDirectoryAlerts } from "./PnodeDirectoryAlerts";
import { PnodeDirectoryKpis } from "./PnodeDirectoryKpis";
import { PnodeDirectoryHeader } from "./PnodeDirectoryHeader";
import { useWatchlist } from "./hooks/useWatchlist";

interface PnodeDirectoryProps {
	initialSnapshot: SnapshotResponse;
}

export function PnodeDirectory({ initialSnapshot }: PnodeDirectoryProps) {
	const [snapshot] = useState(initialSnapshot);
	const [showCharts, setShowCharts] = useState(false);

	// Watchlist hook
	const {
		watchlist,
		toggle: toggleWatchlist,
		count: watchlistCount,
	} = useWatchlist();

	const versions = Object.keys(snapshot.stats.versionDistribution).sort();

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Alerts */}
			<PnodeDirectoryAlerts
				stale={snapshot.stale}
				errors={snapshot.errors}
			/>

			{/* KPI Cards */}
			<PnodeDirectoryKpis
				stats={snapshot.stats}
				watchlistCount={watchlistCount}
			/>

			{/* Page header */}
			<PnodeDirectoryHeader
				sourceMethod={snapshot.source.method}
				watchlistCount={watchlistCount}
				showCharts={showCharts}
				onToggleCharts={() => setShowCharts(!showCharts)}
			/>

			{/* Performance Charts */}
			{showCharts && (
				<div className="space-y-6">
					<PerformanceCharts
						rows={snapshot.rows}
						modalVersion={snapshot.stats.modalVersion}
					/>
					<NetworkHistoryCard />
				</div>
			)}

			{/* Table */}
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
	);
}
