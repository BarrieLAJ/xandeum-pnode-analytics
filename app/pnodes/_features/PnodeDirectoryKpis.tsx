"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Server, Globe, Database, Timer } from "lucide-react";
import type { SnapshotStats } from "@/lib/pnodes/model";
import { formatBytes, formatDurationSeconds } from "@/lib/utils";

interface PnodeDirectoryKpisProps {
	stats: SnapshotStats;
	watchlistCount: number;
}

/**
 * KPI cards for the pNode directory
 */
export function PnodeDirectoryKpis({
	stats,
	watchlistCount,
}: PnodeDirectoryKpisProps) {
	// Fix hydration: only show watchlist count after client-side mount
	const [mounted, setMounted] = useState(false);
	
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<MetricCard
				title="Total pNodes"
				value={stats.totalNodes}
				subtitle="Discovered via pRPC gossip"
				icon={Server}
				delay={0}
			/>
			<MetricCard
				title="Public pNodes"
				value={stats.publicPods ?? stats.nodesWithRpc}
				subtitle={`${Math.round(
					((stats.publicPods ?? stats.nodesWithRpc) / Math.max(stats.totalNodes, 1)) * 100
				)}% publicly reachable`}
				icon={Globe}
				delay={50}
			/>
			<MetricCard
				title="Storage Committed"
				value={formatBytes(stats.totalStorageCommittedBytes)}
				subtitle="Across all pNodes"
				icon={Database}
				delay={100}
			/>
			<MetricCard
				title="Avg Uptime"
				value={formatDurationSeconds(stats.avgUptimeSeconds ?? undefined)}
				subtitle={mounted ? `${watchlistCount} watched` : "Average uptime"}
				icon={Timer}
				delay={150}
			/>
		</div>
	);
}
