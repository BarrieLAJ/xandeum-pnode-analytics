"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WatchlistButton } from "../WatchlistButton";
import { TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
			id: "staking",
			accessorFn: (row) => row.derived.stakingScore ?? 0,
			header: "Staking",
			cell: ({ row }) => {
				const score = row.original.derived.stakingScore;
				const tier = row.original.derived.stakingTier;
				const reasons = row.original.derived.stakingReasons ?? [];

				if (score === undefined || score === null || tier === null) {
					return (
						<TableCell>
							<span className="text-muted-foreground text-sm">—</span>
						</TableCell>
					);
				}

				const tierColors = {
					A: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50",
					B: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50",
					C: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
					D: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50",
				};

				return (
					<TableCell>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className={cn(
												"font-mono text-xs font-semibold",
												tierColors[tier ?? "D"]
											)}
										>
											{tier} ({score})
										</Badge>
									</div>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<div className="space-y-1">
										<p className="font-semibold">Staking Score: {score}/100</p>
										<p className="text-xs text-muted-foreground">Tier: {tier}</p>
										{reasons.length > 0 && (
											<div className="mt-2 pt-2 border-t">
												<p className="text-xs font-medium mb-1">Factors:</p>
												<ul className="text-xs space-y-0.5">
													{reasons.map((reason, i) => (
														<li key={i}>• {reason}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
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

