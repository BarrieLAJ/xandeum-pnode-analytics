"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PnodeRow } from "@/lib/pnodes/model";
import { PnodeCard } from "./PnodeCard";
import { PnodeCardDetails } from "./PnodeCardDetails";
import {
	PnodeTableFilters,
	PnodeTableToolbar,
	usePnodeTableFilters,
} from "../table";
import { cn } from "@/lib/utils";
import {
	pnodesToCSV,
	downloadCSV,
	generateExportFilename,
} from "../table/export/csv";

interface PnodeCardListProps {
	rows: PnodeRow[];
	modalVersion: string | null;
	versions: string[];
	watchlist?: string[];
	onToggleWatchlist?: (pubkey: string) => void;
	probing?: boolean;
	onProbe?: () => void;
	showWatchlistFilter?: boolean;
	className?: string;
}

/**
 * Component that shows cards with infinite scroll for mobile/tablet views
 */
export function PnodeCardList({
	rows,
	modalVersion,
	versions,
	watchlist = [],
	onToggleWatchlist,
	probing = false,
	onProbe,
	showWatchlistFilter = false,
	className,
}: PnodeCardListProps) {
	const [selectedRow, setSelectedRow] = useState<PnodeRow | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [visibleCount, setVisibleCount] = useState(25); // Start with 25 items
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Use the same filter logic as the table
	const {
		search,
		setSearch,
		versionFilter,
		setVersionFilter,
		rpcFilter,
		setRpcFilter,
		watchlistFilter,
		setWatchlistFilter,
		stakingTierFilter,
		setStakingTierFilter,
		filteredRows,
		clearFilters,
		hasActiveFilters,
	} = usePnodeTableFilters({ rows, watchlist });

	const resetVisibleCount = useCallback(() => {
		setVisibleCount(25);
	}, []);

	const handleSearchChange = useCallback(
		(value: string) => {
			setSearch(value);
			resetVisibleCount();
		},
		[resetVisibleCount, setSearch]
	);

	const handleVersionFilterChange = useCallback(
		(value: string) => {
			setVersionFilter(value);
			resetVisibleCount();
		},
		[resetVisibleCount, setVersionFilter]
	);

	const handleRpcFilterChange = useCallback(
		(value: string) => {
			setRpcFilter(value);
			resetVisibleCount();
		},
		[resetVisibleCount, setRpcFilter]
	);

	const handleWatchlistFilterChange = useCallback(
		(value: string) => {
			setWatchlistFilter(value);
			resetVisibleCount();
		},
		[resetVisibleCount, setWatchlistFilter]
	);

	const handleStakingTierFilterChange = useCallback(
		(value: string) => {
			setStakingTierFilter(value);
			resetVisibleCount();
		},
		[resetVisibleCount, setStakingTierFilter]
	);

	const handleClearFilters = useCallback(() => {
		clearFilters();
		resetVisibleCount();
	}, [clearFilters, resetVisibleCount]);

	// Infinite scroll: Get visible rows for mobile
	const visibleRows = filteredRows.slice(0, visibleCount);
	const hasMore = visibleCount < filteredRows.length;

	// Intersection Observer for infinite scroll
	useEffect(() => {
		if (!loadMoreRef.current || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisibleCount((prev) => Math.min(prev + 25, filteredRows.length));
				}
			},
			{
				rootMargin: "100px", // Load more when 100px away from bottom
			}
		);

		observer.observe(loadMoreRef.current);

		return () => {
			observer.disconnect();
		};
	}, [hasMore, filteredRows.length]);

	const handleCardClick = (row: PnodeRow) => {
		setSelectedRow(row);
		setIsDetailsOpen(true);
	};

	const handleExport = useCallback(() => {
		const csv = pnodesToCSV(filteredRows);
		const filename = generateExportFilename("xandeum-pnodes");
		downloadCSV(csv, filename);
	}, [filteredRows]);

	return (
		<>
			<div className={cn("space-y-4", className)}>
				{/* Filters */}
				<div className="shrink-0">
					<PnodeTableFilters
						search={search}
						onSearchChange={handleSearchChange}
						versionFilter={versionFilter}
						onVersionFilterChange={handleVersionFilterChange}
						rpcFilter={rpcFilter}
						onRpcFilterChange={handleRpcFilterChange}
						watchlistFilter={watchlistFilter}
						onWatchlistFilterChange={handleWatchlistFilterChange}
						stakingTierFilter={stakingTierFilter}
						onStakingTierFilterChange={handleStakingTierFilterChange}
						versions={versions}
						watchlistCount={watchlist.length}
						showWatchlistFilter={showWatchlistFilter}
					/>
				</div>

				{/* Toolbar */}
				<div className="shrink-0">
					<PnodeTableToolbar
						filteredCount={filteredRows.length}
						totalCount={rows.length}
						hasActiveFilters={hasActiveFilters}
						onClearFilters={handleClearFilters}
						onProbe={onProbe}
						probing={probing}
						onExport={handleExport}
					/>
				</div>

				{/* Cards Grid with infinite scroll */}
				<div className="space-y-3">
					{visibleRows.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<p>No pNodes found matching your criteria.</p>
						</div>
					) : (
						<>
							{visibleRows.map((row) => (
								<PnodeCard
									key={row.pubkey}
									row={row}
									modalVersion={modalVersion}
									isWatched={watchlist.includes(row.pubkey)}
									onToggleWatchlist={onToggleWatchlist}
									onClick={() => handleCardClick(row)}
								/>
							))}
							{/* Infinite scroll trigger */}
							{hasMore && (
								<div
									ref={loadMoreRef}
									className="flex items-center justify-center py-8"
								>
									<div className="text-sm text-muted-foreground">Loading more...</div>
								</div>
							)}
							{!hasMore && visibleRows.length > 0 && (
								<div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
									Showing all {filteredRows.length} pNodes
								</div>
							)}
						</>
					)}
				</div>
			</div>

			{/* Details Dialog */}
			<PnodeCardDetails
				row={selectedRow}
				modalVersion={modalVersion}
				open={isDetailsOpen}
				onOpenChange={setIsDetailsOpen}
			/>
		</>
	);
}
