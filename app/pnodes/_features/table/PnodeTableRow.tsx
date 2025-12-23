"use client";

import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WatchlistButton } from "../WatchlistButton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatBytes } from "@/lib/utils";
import { PnodeTableActionsCell } from "./PnodeTableActionsCell";

interface PnodeTableRowProps {
	row: PnodeRow;
	modalVersion: string | null;
	isWatched: boolean;
	onToggleWatchlist?: (pubkey: string) => void;
}

export function PnodeTableRow({
	row,
	modalVersion,
	isWatched,
	onToggleWatchlist,
}: PnodeTableRowProps) {
	return (
		<TableRow className="group">
			<TableCell>
				<div className="flex items-center gap-2">
					{onToggleWatchlist && (
						<WatchlistButton
							pubkey={row.pubkey}
							isWatched={isWatched}
							onToggle={onToggleWatchlist}
						/>
					)}
					<div className="flex flex-col">
						<code className="text-sm font-mono">{row.derived.shortPubkey}</code>
					</div>
					<CopyButton value={row.pubkey} label="Copy pubkey" />
				</div>
			</TableCell>
			<TableCell>
				<VersionBadge version={row.version} modalVersion={modalVersion} />
			</TableCell>
			<TableCell>
				<StatusBadge
					status={row.pod?.isPublic ? "online" : "offline"}
					label={row.pod?.isPublic ? "Public" : "Private"}
					tooltip={
						row.pod?.isPublic
							? "pRPC endpoint is publicly reachable"
							: "pRPC endpoint is not publicly reachable"
					}
					className={cn("text-xs")}
				/>
			</TableCell>
			<TableCell>
				<div className="flex flex-col gap-0.5">
					<span className="font-mono text-sm">
						{formatBytes(row.pod?.storageUsedBytes)}
					</span>
					{row.pod?.storageCommittedBytes && (
						<span className="font-mono text-xs text-muted-foreground">
							/ {formatBytes(row.pod.storageCommittedBytes)}
						</span>
					)}
				</div>
			</TableCell>
			<TableCell>
				{row.pod?.credits !== undefined && row.pod.credits !== null ? (
					<span className="font-mono text-sm">
						{row.pod.credits.toLocaleString()}
					</span>
				) : (
					<span className="text-muted-foreground text-sm">—</span>
				)}
			</TableCell>
			<PnodeTableActionsCell row={row} />
		</TableRow>
	);
}
