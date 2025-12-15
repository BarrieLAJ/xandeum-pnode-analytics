"use client";

import { useState } from "react";
import { SnapshotResponse } from "@/lib/pnodes/model";
import { PnodeTable } from "./PnodeTable";
import { PerformanceCharts } from "./charts/PerformanceCharts";
import { PnodeDirectoryAlerts } from "./PnodeDirectoryAlerts";
import { PnodeDirectoryKpis } from "./PnodeDirectoryKpis";
import { PnodeDirectoryHeader } from "./PnodeDirectoryHeader";
import { useWatchlist } from "./hooks/useWatchlist";
import { useProbeMutation } from "./hooks/useProbeMutation";

interface PnodeDirectoryProps {
	initialSnapshot: SnapshotResponse;
}

export function PnodeDirectory({ initialSnapshot }: PnodeDirectoryProps) {
	const [snapshot, setSnapshot] = useState(initialSnapshot);
	const [showCharts, setShowCharts] = useState(false);

	// Watchlist hook
	const {
		watchlist,
		toggle: toggleWatchlist,
		count: watchlistCount,
	} = useWatchlist();

	// Probe mutation
	const probeMutation = useProbeMutation();
	const probing = probeMutation.isPending;
	const probeStats = probeMutation.data?.stats ?? null;
	const probeError = probeMutation.error?.message ?? null;

	const versions = Object.keys(snapshot.stats.versionDistribution).sort();

	const handleProbe = () => {
		probeMutation.mutate(true, {
			onSuccess: (data) => {
				// Update rows with probe results
				setSnapshot((prev) => ({
					...prev,
					rows: data.rows,
				}));
			},
		});
	};

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Alerts */}
			<PnodeDirectoryAlerts
				stale={snapshot.stale}
				errors={snapshot.errors}
				probeError={probeError}
			/>

			{/* KPI Cards */}
			<PnodeDirectoryKpis
				stats={snapshot.stats}
				probeStats={probeStats}
				watchlistCount={watchlistCount}
			/>

			{/* Page header */}
			<PnodeDirectoryHeader
				sourceMethod={snapshot.source.method}
				hasProbeData={probeStats !== null}
				watchlistCount={watchlistCount}
				showCharts={showCharts}
				onToggleCharts={() => setShowCharts(!showCharts)}
			/>

			{/* Performance Charts */}
			{showCharts && (
				<PerformanceCharts
					rows={snapshot.rows}
					modalVersion={snapshot.stats.modalVersion}
				/>
			)}

			{/* Table */}
			<PnodeTable
				rows={snapshot.rows}
				modalVersion={snapshot.stats.modalVersion}
				versions={versions}
				showProbeColumn={probeStats !== null}
				probing={probing}
				onProbe={handleProbe}
				watchlist={watchlist}
				onToggleWatchlist={toggleWatchlist}
				showWatchlistFilter={true}
			/>
		</div>
	);
}
