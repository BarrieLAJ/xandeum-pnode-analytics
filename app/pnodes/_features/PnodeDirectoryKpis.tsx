"use client";

import { MetricCard } from "@/components/shared/MetricCard";
import { Server, Radio, GitBranch, Activity, Zap, Star } from "lucide-react";
import type { ProbeStats } from "./hooks/usePnodeProbe";

interface SnapshotStats {
	totalNodes: number;
	nodesWithRpc: number;
	uniqueVersions: number;
	modalVersion: string | null;
}

interface PnodeDirectoryKpisProps {
	stats: SnapshotStats;
	probeStats: ProbeStats | null;
	watchlistCount: number;
}

/**
 * KPI cards for the pNode directory
 */
export function PnodeDirectoryKpis({
	stats,
	probeStats,
	watchlistCount,
}: PnodeDirectoryKpisProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<MetricCard
				title="Total pNodes"
				value={stats.totalNodes}
				subtitle="In gossip network"
				icon={Server}
				delay={0}
			/>
			<MetricCard
				title="With RPC"
				value={stats.nodesWithRpc}
				subtitle={`${Math.round(
					(stats.nodesWithRpc / Math.max(stats.totalNodes, 1)) * 100
				)}% of nodes`}
				icon={Radio}
				delay={50}
			/>
			{probeStats ? (
				<>
					<MetricCard
						title="RPC Reachable"
						value={probeStats.reachable}
						subtitle={`${probeStats.unreachable} unreachable`}
						icon={Activity}
						delay={100}
					/>
					<MetricCard
						title="Avg Latency"
						value={probeStats.avgLatencyMs ? `${probeStats.avgLatencyMs}ms` : "—"}
						subtitle={
							probeStats.minLatencyMs && probeStats.maxLatencyMs
								? `${probeStats.minLatencyMs}ms - ${probeStats.maxLatencyMs}ms`
								: "No data"
						}
						icon={Zap}
						delay={150}
					/>
				</>
			) : (
				<>
					<MetricCard
						title="Unique Versions"
						value={stats.uniqueVersions}
						subtitle={`Modal: ${stats.modalVersion ?? "—"}`}
						icon={GitBranch}
						delay={100}
					/>
					<MetricCard
						title="Watchlist"
						value={watchlistCount}
						subtitle="Saved pNodes"
						icon={Star}
						delay={150}
					/>
				</>
			)}
		</div>
	);
}
