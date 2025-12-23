"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WatchlistButton } from "../WatchlistButton";
import { TableCell } from "@/components/ui/table";
import { cn, formatBytes } from "@/lib/utils";
import { PnodeTableActionsCell } from "./PnodeTableActionsCell";

/**
 * Column definitions for the pNode table.
 * This file contains all column definitions to keep the table structure composable.
 */
export type PnodeTableColumnDef = ColumnDef<PnodeRow>;

/**
 * Creates column definitions for the pNode table.
 * 
 * @param options - Configuration options for columns
 * @param options.modalVersion - The modal (most common) version for highlighting
 * @param options.watchlist - Array of pubkeys in the watchlist
 * @param options.onToggleWatchlist - Callback to toggle watchlist status
 * @returns Array of column definitions
 */
export function createPnodeTableColumns(options: {
	modalVersion: string | null;
	watchlist?: string[];
	onToggleWatchlist?: (pubkey: string) => void;
}): PnodeTableColumnDef[] {
	const { modalVersion, watchlist = [], onToggleWatchlist } = options;

	return [
		{
			id: "pubkey",
			accessorKey: "pubkey",
			header: "Pubkey",
			cell: ({ row }) => {
				const isWatched = watchlist.includes(row.original.pubkey);
				return (
					<TableCell>
						<div className="flex items-center gap-2">
							{onToggleWatchlist && (
								<WatchlistButton
									pubkey={row.original.pubkey}
									isWatched={isWatched}
									onToggle={onToggleWatchlist}
								/>
							)}
							<div className="flex flex-col">
								<code className="text-sm font-mono">
									{row.original.derived.shortPubkey}
								</code>
							</div>
							<CopyButton value={row.original.pubkey} label="Copy pubkey" />
						</div>
					</TableCell>
				);
			},
			enableSorting: true,
		},
		{
			id: "version",
			accessorKey: "version",
			header: "Version",
			cell: ({ row }) => {
				return (
					<TableCell>
						<VersionBadge
							version={row.original.version}
							modalVersion={modalVersion}
						/>
					</TableCell>
				);
			},
			enableSorting: true,
		},
		{
			id: "status",
			accessorFn: (row) => row.pod?.isPublic ?? false,
			header: "Status",
			cell: ({ row }) => {
				return (
					<TableCell>
						<StatusBadge
							status={row.original.pod?.isPublic ? "online" : "offline"}
							label={row.original.pod?.isPublic ? "Public" : "Private"}
							tooltip={
								row.original.pod?.isPublic
									? "pRPC endpoint is publicly reachable"
									: "pRPC endpoint is not publicly reachable"
							}
							className={cn("text-xs")}
						/>
					</TableCell>
				);
			},
			enableSorting: true,
		},
		{
			id: "storage",
			accessorFn: (row) => row.pod?.storageUsedBytes ?? 0,
			header: "Storage",
			cell: ({ row }) => {
				return (
					<TableCell>
						<div className="flex flex-col gap-0.5">
							<span className="font-mono text-sm">
								{formatBytes(row.original.pod?.storageUsedBytes)}
							</span>
							{row.original.pod?.storageCommittedBytes && (
								<span className="font-mono text-xs text-muted-foreground">
									/ {formatBytes(row.original.pod.storageCommittedBytes)}
								</span>
							)}
						</div>
					</TableCell>
				);
			},
			enableSorting: true,
		},
		{
			id: "credits",
			accessorFn: (row) => row.pod?.credits ?? null,
			header: "Credits",
			cell: ({ row }) => {
				return (
					<TableCell>
						{row.original.pod?.credits !== undefined &&
						row.original.pod.credits !== null ? (
							<span className="font-mono text-sm">
								{row.original.pod.credits.toLocaleString()}
							</span>
						) : (
							<span className="text-muted-foreground text-sm">—</span>
						)}
					</TableCell>
				);
			},
			enableSorting: true,
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				return <PnodeTableActionsCell row={row.original} />;
			},
			enableSorting: false,
		},
	];
}

