"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface PnodeDirectoryHeaderProps {
	/** Number of watched nodes */
	watchlistCount: number;
}

/**
 * Page header with title, description, and status badges
 */
export function PnodeDirectoryHeader({
	watchlistCount,
}: PnodeDirectoryHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">pNode Directory</h1>
				<p className="text-muted-foreground mt-1">
					All pNodes discovered via gossip from the Xandeum network
				</p>
			</div>
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="gap-1.5">
					<span className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
					Live
				</Badge>
				{watchlistCount > 0 && (
					<Badge
						variant="outline"
						className="gap-1.5 text-chart-3 border-chart-3/30"
					>
						<Star className="h-3 w-3 fill-chart-3" />
						{watchlistCount} watched
					</Badge>
				)}
			</div>
		</div>
	);
}
