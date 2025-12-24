"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PnodeRow } from "@/lib/pnodes/model";
import {
	pnodesToCSV,
	downloadCSV,
	generateExportFilename,
} from "./table/export/csv";
import { DataTable } from "@/components/ui/data-table";
import {
	PnodeTableFilters,
	PnodeTableToolbar,
	PnodeTablePagination,
	usePnodeTableFilters,
} from "./table";
import { createPnodeTableColumns } from "./table/PnodeTableColumns";

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

	// Create column definitions
	const columns = useMemo(
		() =>
			createPnodeTableColumns({
				modalVersion,
				watchlist,
				onToggleWatchlist,
			}),
		[modalVersion, watchlist, onToggleWatchlist]
	);

	// Map TanStack column IDs to our sort field types
	const sortFieldMap: Record<
		string,
		"pubkey" | "version" | "public" | "storageUsed" | "credits"
	> = useMemo(
		() => ({
			pubkey: "pubkey",
			version: "version",
			status: "public",
			storage: "storageUsed",
			credits: "credits",
		}),
		[]
	);

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
					<DataTable<PnodeRow>
						columns={columns}
						data={paginatedRows}
						sorting={{
							sortField: sortField,
							onSort: (columnId) => {
								const field = sortFieldMap[columnId];
								if (field) toggleSort(field);
							},
							fieldMap: sortFieldMap,
						}}
						emptyConfig={{
							message: "No pNodes found matching your criteria.",
							colSpan: columns.length,
						}}
						getRowId={(row) => row.pubkey}
						getRowClassName={() => "group"}
						getHeaderClassName={(columnId) => {
							if (columnId === "pubkey") return "w-[280px]";
							if (columnId === "actions") return "text-right w-[100px]";
							return "";
						}}
						manualSorting={true}
						manualPagination={true}
						enableSorting={true}
					/>
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
