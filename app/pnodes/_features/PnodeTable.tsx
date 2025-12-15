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
	usePnodeTableFilters,
} from "./table";

interface PnodeTableProps {
	rows: PnodeRow[];
	modalVersion: string | null;
	versions: string[];
	className?: string;
	showProbeColumn?: boolean;
	probing?: boolean;
	onProbe?: () => void;
	watchlist?: string[];
	onToggleWatchlist?: (pubkey: string) => void;
	showWatchlistFilter?: boolean;
}

export function PnodeTable({
	rows,
	modalVersion,
	versions,
	className,
	showProbeColumn = false,
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
		sortOrder,
		toggleSort,
		filteredRows,
		clearFilters,
		hasActiveFilters,
	} = usePnodeTableFilters({ rows, watchlist });

	const handleExport = useCallback(() => {
		const csv = pnodesToCSV(filteredRows);
		const filename = generateExportFilename("xandeum-pnodes");
		downloadCSV(csv, filename);
	}, [filteredRows]);

	return (
		<div className={cn("space-y-4", className)}>
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

			<PnodeTableToolbar
				filteredCount={filteredRows.length}
				totalCount={rows.length}
				hasActiveFilters={hasActiveFilters}
				onClearFilters={clearFilters}
				onProbe={onProbe}
				probing={probing}
				onExport={handleExport}
			/>

			{/* Table */}
			<div className="rounded-lg border border-border/50 bg-card overflow-hidden">
				<div className="overflow-x-auto scrollbar-thin">
					<Table>
						<PnodeTableHeader
							sortField={sortField}
							sortOrder={sortOrder}
							onSort={toggleSort}
							showProbeColumn={showProbeColumn}
						/>
						<TableBody>
							{filteredRows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={showProbeColumn ? 6 : 5}
										className="h-24 text-center text-muted-foreground"
									>
										No pNodes found matching your criteria.
									</TableCell>
								</TableRow>
							) : (
								filteredRows.map((row) => (
									<PnodeTableRow
										key={row.pubkey}
										row={row}
										modalVersion={modalVersion}
										showProbeColumn={showProbeColumn}
										isWatched={watchlist.includes(row.pubkey)}
										onToggleWatchlist={onToggleWatchlist}
									/>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
