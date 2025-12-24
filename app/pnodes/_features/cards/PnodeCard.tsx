"use client";

import { PnodeRow } from "@/lib/pnodes/model";
import { Card } from "@/components/ui/card";
import { StatusBadge, VersionBadge } from "@/components/shared/StatusBadge";
import { WatchlistButton } from "../WatchlistButton";
import { CopyButton } from "@/components/shared/CopyButton";
import { cn, formatBytes } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface PnodeCardProps {
	row: PnodeRow;
	modalVersion: string | null;
	isWatched: boolean;
	onToggleWatchlist?: (pubkey: string) => void;
	onClick?: () => void;
}

/**
 * Compact card component for mobile/responsive view showing key pNode information
 */
export function PnodeCard({
	row,
	modalVersion,
	isWatched,
	onToggleWatchlist,
	onClick,
}: PnodeCardProps) {
	return (
		<Card
			className={cn(
				"cursor-pointer transition-all hover:shadow-md hover:border-primary/20",
				"py-4 px-4"
			)}
			onClick={onClick}
		>
			<div className="flex flex-col gap-3">
				{/* Header: Pubkey with watchlist and copy */}
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 min-w-0 flex-1">
						{onToggleWatchlist && (
							<WatchlistButton
								pubkey={row.pubkey}
								isWatched={isWatched}
								onToggle={onToggleWatchlist}
							/>
						)}
						<div className="flex flex-col min-w-0 flex-1">
							<code className="text-sm font-mono truncate">
								{row.derived.shortPubkey}
							</code>
						</div>
						<CopyButton value={row.pubkey} label="Copy pubkey" />
					</div>
					<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
				</div>

				{/* Key metrics in a flex row */}
				<div className="flex flex-wrap items-center gap-3">
					{/* Version */}
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">Version:</span>
						<VersionBadge
							version={row.version}
							modalVersion={modalVersion}
						/>
					</div>

					{/* Status */}
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">Status:</span>
						<StatusBadge
							status={row.pod?.isPublic ? "online" : "offline"}
							label={row.pod?.isPublic ? "Public" : "Private"}
							className="text-xs"
						/>
					</div>

					{/* Storage */}
					{row.pod?.storageUsedBytes !== undefined && (
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">Storage:</span>
							<span className="text-xs font-mono">
								{formatBytes(row.pod.storageUsedBytes)}
							</span>
						</div>
					)}

					{/* Credits */}
					{row.pod?.credits !== undefined && row.pod.credits !== null && (
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground">Credits:</span>
							<span className="text-xs font-mono">
								{row.pod.credits.toLocaleString()}
							</span>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}

