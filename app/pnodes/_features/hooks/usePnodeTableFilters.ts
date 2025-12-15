"use client";

import { useState, useMemo } from "react";
import { PnodeRow } from "@/lib/pnodes/model";

type SortField = "pubkey" | "version" | "ip" | "endpointCount" | "latency";
type SortOrder = "asc" | "desc";

interface UsePnodeTableFiltersProps {
  rows: PnodeRow[];
  watchlist: string[];
}

export function usePnodeTableFilters({ rows, watchlist }: UsePnodeTableFiltersProps) {
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [rpcFilter, setRpcFilter] = useState<string>("all");
  const [watchlistFilter, setWatchlistFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("pubkey");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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
    if (rpcFilter === "hasRpc") {
      result = result.filter((row) => row.derived.hasRpc);
    } else if (rpcFilter === "noRpc") {
      result = result.filter((row) => !row.derived.hasRpc);
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
        case "ip":
          comparison = (a.derived.ipAddress ?? "").localeCompare(
            b.derived.ipAddress ?? ""
          );
          break;
        case "endpointCount":
          comparison = a.derived.endpointCount - b.derived.endpointCount;
          break;
        case "latency":
          const aLatency = a.probe?.latencyMs ?? 999999;
          const bLatency = b.probe?.latencyMs ?? 999999;
          comparison = aLatency - bLatency;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [rows, search, versionFilter, rpcFilter, watchlistFilter, watchlist, sortField, sortOrder]);

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
    clearFilters,
    hasActiveFilters,
  };
}

