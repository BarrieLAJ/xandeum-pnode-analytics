"use client";

import { useState, useMemo, useEffect } from "react";
import { PnodeRow } from "@/lib/pnodes/model";

type SortField = "pubkey" | "version" | "public" | "storageUsed" | "credits";
type SortOrder = "asc" | "desc";

interface UsePnodeTableFiltersProps {
	rows: PnodeRow[];
	watchlist: string[];
	pageSize?: number;
}

export function usePnodeTableFilters({
	rows,
	watchlist,
	pageSize = 25,
}: UsePnodeTableFiltersProps) {
	const [search, setSearch] = useState("");
	const [versionFilter, setVersionFilter] = useState<string>("all");
	const [rpcFilter, setRpcFilter] = useState<string>("all"); // kept name for compatibility: maps to Public/Private
	const [watchlistFilter, setWatchlistFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("pubkey");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
	const [currentPage, setCurrentPage] = useState(1);

	const filteredRows = useMemo(() => {
		let result = [...rows];

		// Search filter
		if (search) {
			const searchLower = search.toLowerCase();
			result = result.filter(
				(row) =>
					row.pubkey.toLowerCase().includes(searchLower) ||
					row.derived.ipAddress?.includes(searchLower) ||
					row.version?.toLowerCase().includes(searchLower)
			);
		}

		// Version filter
		if (versionFilter !== "all") {
			result = result.filter((row) => row.version === versionFilter);
		}

		// RPC filter
		// In pNode pRPC world, `hasRpc` effectively means "publicly reachable".
		if (rpcFilter === "hasRpc") {
			result = result.filter((row) => row.pod?.isPublic ?? row.derived.hasRpc);
		} else if (rpcFilter === "noRpc") {
			result = result.filter((row) => !(row.pod?.isPublic ?? row.derived.hasRpc));
		}

		// Watchlist filter
		if (watchlistFilter === "watched") {
			result = result.filter((row) => watchlist.includes(row.pubkey));
		} else if (watchlistFilter === "notWatched") {
			result = result.filter((row) => !watchlist.includes(row.pubkey));
		}

		// Sort
		result.sort((a, b) => {
			let comparison = 0;
			switch (sortField) {
				case "pubkey":
					comparison = a.pubkey.localeCompare(b.pubkey);
					break;
				case "version":
					comparison = (a.version ?? "").localeCompare(b.version ?? "");
					break;
				case "public":
					comparison =
						Number(a.pod?.isPublic ?? false) - Number(b.pod?.isPublic ?? false);
					break;
				case "storageUsed":
					comparison =
						(a.pod?.storageUsedBytes ?? 0) - (b.pod?.storageUsedBytes ?? 0);
					break;
				case "credits":
					const aCredits = a.pod?.credits ?? null;
					const bCredits = b.pod?.credits ?? null;
					if (aCredits === null && bCredits === null) comparison = 0;
					else if (aCredits === null) comparison = 1; // nulls last
					else if (bCredits === null) comparison = -1; // nulls last
					else comparison = aCredits - bCredits;
					break;
			}
			return sortOrder === "asc" ? comparison : -comparison;
		});

		return result;
	}, [
		rows,
		search,
		versionFilter,
		rpcFilter,
		watchlistFilter,
		watchlist,
		sortField,
		sortOrder,
	]);

	// Reset to page 1 when filters change
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setCurrentPage(1);
	}, [search, versionFilter, rpcFilter, watchlistFilter, sortField, sortOrder]);

	// Calculate pagination
	const totalPages = Math.ceil(filteredRows.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedRows = filteredRows.slice(startIndex, endIndex);

	const toggleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("asc");
		}
	};

	const clearFilters = () => {
		setSearch("");
		setVersionFilter("all");
		setRpcFilter("all");
		setWatchlistFilter("all");
	};

	const hasActiveFilters =
		search !== "" ||
		versionFilter !== "all" ||
		rpcFilter !== "all" ||
		watchlistFilter !== "all";

	const goToPage = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const previousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	return {
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
		paginatedRows,
		clearFilters,
		hasActiveFilters,
		// Pagination
		currentPage,
		totalPages,
		pageSize,
		startIndex: startIndex + 1, // 1-based for display
		endIndex: Math.min(endIndex, filteredRows.length),
		goToPage,
		nextPage,
		previousPage,
	};
}
