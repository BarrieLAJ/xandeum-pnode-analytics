"use client";

import * as React from "react";
import {
	useReactTable,
	getCoreRowModel,
	type ColumnDef,
	flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Configuration for sorting behavior
 */
export interface DataTableSortConfig {
	/** Current sort field (column ID) */
	sortField: string | null;
	/** Callback when sort is toggled */
	onSort: (columnId: string) => void;
	/** Optional mapping from column ID to sort field */
	fieldMap?: Record<string, string>;
}

/**
 * Configuration for empty state
 */
export interface DataTableEmptyConfig {
	/** Message to display when no data */
	message?: string;
	/** Number of columns to span */
	colSpan?: number;
}

/**
 * Props for the DataTable component
 */
export interface DataTableProps<TData> {
	/** Column definitions */
	columns: ColumnDef<TData>[];
	/** Data to display */
	data: TData[];
	/** Optional sorting configuration */
	sorting?: DataTableSortConfig;
	/** Optional empty state configuration */
	emptyConfig?: DataTableEmptyConfig;
	/** Optional class name for the table container */
	className?: string;
	/** Optional class name for the table wrapper */
	tableWrapperClassName?: string;
	/** Optional row key getter function */
	getRowId?: (row: TData) => string;
	/** Optional row class name getter */
	getRowClassName?: (row: TData) => string;
	/** Optional header class name getter */
	getHeaderClassName?: (columnId: string) => string;
	/** Enable manual sorting (default: true) */
	manualSorting?: boolean;
	/** Enable manual pagination (default: true) */
	manualPagination?: boolean;
	/** Enable sorting (default: true) */
	enableSorting?: boolean;
}

/**
 * Generic DataTable component that abstracts TanStack Table logic.
 *
 * This component handles all the TanStack Table setup and rendering,
 * making it easy to swap out the table implementation in the future.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { id: "name", header: "Name", cell: ({ row }) => row.original.name }
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   sorting={{
 *     sortField: "name",
 *     onSort: (columnId) => handleSort(columnId)
 *   }}
 * />
 * ```
 */
export function DataTable<TData>({
	columns,
	data,
	sorting,
	emptyConfig,
	className,
	tableWrapperClassName,
	getRowId,
	getRowClassName,
	getHeaderClassName,
	manualSorting = true,
	manualPagination = true,
	enableSorting = true,
}: DataTableProps<TData>) {
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualSorting,
		manualPagination,
		enableSorting,
		getRowId,
	});

	const emptyMessage = emptyConfig?.message ?? "No data available.";
	const colSpan = emptyConfig?.colSpan ?? columns.length;

	return (
		<Table className={cn(className, tableWrapperClassName)}>
			<TableHeader className="sticky top-0 z-10 bg-card">
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow
						key={headerGroup.id}
						className="bg-muted/50 hover:bg-muted/50 backdrop-blur-sm"
					>
						{headerGroup.headers.map((header) => {
							const columnId = header.column.id;
							const isSortable =
								enableSorting && header.column.getCanSort() && sorting !== undefined;
							const isSorted = sorting?.sortField === columnId;

							return (
								<TableHead
									key={header.id}
									className={cn(getHeaderClassName?.(columnId))}
								>
									{isSortable ? (
										<Button
											variant="ghost"
											size="sm"
											className="-ml-3 h-8 gap-1 font-medium"
											onClick={() => {
												if (sorting) {
													// Use field map if provided, otherwise use column ID directly
													const field = sorting.fieldMap?.[columnId] ?? columnId;
													sorting.onSort(field);
												}
											}}
										>
											{flexRender(header.column.columnDef.header, header.getContext())}
											<ArrowUpDown
												className={cn(
													"h-3.5 w-3.5",
													isSorted ? "text-primary" : "text-muted-foreground"
												)}
											/>
										</Button>
									) : (
										flexRender(header.column.columnDef.header, header.getContext())
									)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={colSpan}
							className="h-24 text-center text-muted-foreground"
						>
							{emptyMessage}
						</TableCell>
					</TableRow>
				) : (
					table.getRowModel().rows.map((row) => {
						const rowData = row.original;
						const rowKey = getRowId ? getRowId(rowData) : row.id;
						const rowClassName = getRowClassName?.(rowData);

						return (
							<TableRow key={rowKey} className={rowClassName}>
								{row.getVisibleCells().map((cell) => (
									<React.Fragment key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</React.Fragment>
								))}
							</TableRow>
						);
					})
				)}
			</TableBody>
		</Table>
	);
}
