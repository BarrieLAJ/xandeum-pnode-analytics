"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { PnodeRow } from "@/lib/pnodes/model";
import {
	pnodesToCSV,
	downloadCSV,
	generateExportFilename,
} from "./table/export/csv";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
	PnodeTableFilters,
	PnodeTableToolbar,
	PnodeTableHeader,
	PnodeTableRow,
	PnodeTablePagination,
	usePnodeTableFilters,
} from "./table";

interface PnodeTableProps {
	rows: PnodeRow[];
	modalVersion: string | null;
	versions: string[];
	className?: string;
	probing?: boolean;
	onProbe?: () => void;
	watchlist?: string[];
	onToggleWatchlist?: (pubkey: string) => boolean | void;
	showWatchlistFilter?: boolean;
	containerHeight?: number | null;
}

export function PnodeTable({
	rows,
	modalVersion,
	versions,
	className,
	probing = false,
	onProbe,
	watchlist = [],
	onToggleWatchlist,
	showWatchlistFilter = false,
	containerHeight,
}: PnodeTableProps) {
	const {
		search,
		setSearch,
		versionFilter,
		setVersionFilter,
		rpcFilter,
		setRpcFilter,
		watchlistFilter,
		setWatchlistFilter,
		sortField,
		toggleSort,
		filteredRows,
		paginatedRows,
		clearFilters,
		hasActiveFilters,
		currentPage,
		totalPages,
		startIndex,
		endIndex,
		goToPage,
		nextPage,
		previousPage,
	} = usePnodeTableFilters({ rows, watchlist });

	const handleExport = useCallback(() => {
		const csv = pnodesToCSV(filteredRows);
		const filename = generateExportFilename("xandeum-pnodes");
		downloadCSV(csv, filename);
	}, [filteredRows]);

	return (
		<div className={cn("flex flex-col h-full min-h-0 space-y-4", className)}>
			{/* Filters - Fixed at top, always visible */}
			<div className="shrink-0">
				<PnodeTableFilters
					search={search}
					onSearchChange={setSearch}
					versionFilter={versionFilter}
					onVersionFilterChange={setVersionFilter}
					rpcFilter={rpcFilter}
					onRpcFilterChange={setRpcFilter}
					watchlistFilter={watchlistFilter}
					onWatchlistFilterChange={setWatchlistFilter}
					versions={versions}
					watchlistCount={watchlist.length}
					showWatchlistFilter={showWatchlistFilter}
				/>
			</div>

			{/* Toolbar - Fixed below filters, always visible */}
			<div className="shrink-0">
				<PnodeTableToolbar
					filteredCount={filteredRows.length}
					totalCount={rows.length}
					hasActiveFilters={hasActiveFilters}
					onClearFilters={clearFilters}
					onProbe={onProbe}
					probing={probing}
					onExport={handleExport}
				/>
			</div>

			{/* Table container - Fills remaining space, only table body scrolls */}
			<div className="flex-1 flex flex-col min-h-0 rounded-lg border border-border/50 bg-card overflow-hidden">
				{/* Table with sticky header - Scrollable body */}
				<div className="flex-1 overflow-auto scrollbar-thin min-h-0">
					<Table>
						<PnodeTableHeader sortField={sortField} onSort={toggleSort} />
						<TableBody>
							{paginatedRows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className="h-24 text-center text-muted-foreground"
									>
										No pNodes found matching your criteria.
									</TableCell>
								</TableRow>
							) : (
								paginatedRows.map((row) => (
									<PnodeTableRow
										key={row.pubkey}
										row={row}
										modalVersion={modalVersion}
										isWatched={watchlist.includes(row.pubkey)}
										onToggleWatchlist={onToggleWatchlist}
									/>
								))
							)}
						</TableBody>
					</Table>
				</div>
				{/* Pagination - Fixed at bottom, always visible */}
				<div className="shrink-0 border-t bg-card">
					<PnodeTablePagination
						currentPage={currentPage}
						totalPages={totalPages}
						startIndex={startIndex}
						endIndex={endIndex}
						totalItems={filteredRows.length}
						onPageChange={goToPage}
						onPrevious={previousPage}
						onNext={nextPage}
					/>
				</div>
			</div>
		</div>
	);
}
