"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface PnodeTableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  versionFilter: string;
  onVersionFilterChange: (value: string) => void;
  rpcFilter: string;
  onRpcFilterChange: (value: string) => void;
  watchlistFilter: string;
  onWatchlistFilterChange: (value: string) => void;
  versions: string[];
  watchlistCount: number;
  showWatchlistFilter: boolean;
}

export function PnodeTableFilters({
  search,
  onSearchChange,
  versionFilter,
  onVersionFilterChange,
  rpcFilter,
  onRpcFilterChange,
  watchlistFilter,
  onWatchlistFilterChange,
  versions,
  watchlistCount,
  showWatchlistFilter,
}: PnodeTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by pubkey, IP, or version..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={versionFilter} onValueChange={onVersionFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All versions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All versions</SelectItem>
          {versions.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={rpcFilter} onValueChange={onRpcFilterChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="RPC Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All nodes</SelectItem>
          <SelectItem value="hasRpc">Has RPC</SelectItem>
          <SelectItem value="noRpc">No RPC</SelectItem>
        </SelectContent>
      </Select>
      {showWatchlistFilter && watchlistCount > 0 && (
        <Select value={watchlistFilter} onValueChange={onWatchlistFilterChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Watchlist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All nodes</SelectItem>
            <SelectItem value="watched">Watched ({watchlistCount})</SelectItem>
            <SelectItem value="notWatched">Not watched</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

