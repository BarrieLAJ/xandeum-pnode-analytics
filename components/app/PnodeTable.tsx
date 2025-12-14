"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PnodeRow } from "@/lib/pnodes/model";
import {
  pnodesToCSV,
  downloadCSV,
  generateExportFilename,
} from "@/lib/export/csv";
import { CopyButton } from "./CopyButton";
import { VersionBadge } from "./StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  Server,
  Globe,
  Radio,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
} from "lucide-react";

interface PnodeTableProps {
  rows: PnodeRow[];
  modalVersion: string | null;
  versions: string[];
  className?: string;
  showProbeColumn?: boolean;
  probing?: boolean;
  onProbe?: () => void;
}

type SortField = "pubkey" | "version" | "ip" | "endpointCount" | "latency";
type SortOrder = "asc" | "desc";

export function PnodeTable({
  rows,
  modalVersion,
  versions,
  className,
  showProbeColumn = false,
  probing = false,
  onProbe,
}: PnodeTableProps) {
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [rpcFilter, setRpcFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("pubkey");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filter and sort rows
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
          // Sort by latency, putting unreachable/no-probe at the end
          const aLatency = a.probe?.latencyMs ?? 999999;
          const bLatency = b.probe?.latencyMs ?? 999999;
          comparison = aLatency - bLatency;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [rows, search, versionFilter, rpcFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleExport = useCallback(() => {
    const csv = pnodesToCSV(filteredRows);
    const filename = generateExportFilename("xandeum-pnodes");
    downloadCSV(csv, filename);
  }, [filteredRows]);

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 font-medium"
      onClick={() => toggleSort(field)}
    >
      {children}
      <ArrowUpDown
        className={cn(
          "h-3.5 w-3.5",
          sortField === field ? "text-primary" : "text-muted-foreground"
        )}
      />
    </Button>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by pubkey, IP, or version..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={versionFilter} onValueChange={setVersionFilter}>
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
        <Select value={rpcFilter} onValueChange={setRpcFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="RPC Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All nodes</SelectItem>
            <SelectItem value="hasRpc">Has RPC</SelectItem>
            <SelectItem value="noRpc">No RPC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count and probe button */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredRows.length} of {rows.length} pNodes
        </span>
        <div className="flex items-center gap-2">
          {(search || versionFilter !== "all" || rpcFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setVersionFilter("all");
                setRpcFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
          {onProbe && (
            <Button
              variant="outline"
              size="sm"
              onClick={onProbe}
              disabled={probing}
              className="gap-2"
            >
              {probing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Probing...
                </>
              ) : (
                <>
                  <Radio className="h-3.5 w-3.5" />
                  Test RPC Health
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[300px]">
                  <SortableHeader field="pubkey">Pubkey</SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="ip">IP Address</SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="version">Version</SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="endpointCount">
                    Endpoints
                  </SortableHeader>
                </TableHead>
                {showProbeColumn && (
                  <TableHead>
                    <SortableHeader field="latency">RPC Health</SortableHeader>
                  </TableHead>
                )}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
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
                  <TableRow key={row.pubkey} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          <Server className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <code className="text-sm font-mono">
                            {row.derived.shortPubkey}
                          </code>
                        </div>
                        <CopyButton value={row.pubkey} label="Copy pubkey" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {row.derived.ipAddress ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <VersionBadge
                        version={row.version}
                        modalVersion={modalVersion}
                      />
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Radio
                                className={cn(
                                  "h-3.5 w-3.5",
                                  row.derived.hasRpc
                                    ? "text-chart-2"
                                    : "text-muted-foreground"
                                )}
                              />
                              <span className="text-sm">
                                {row.derived.endpointCount}/10
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-1">
                              <p>
                                RPC: {row.derived.hasRpc ? "Yes" : "No"}
                              </p>
                              <p>
                                Pubsub: {row.derived.hasPubsub ? "Yes" : "No"}
                              </p>
                              <p>
                                {row.derived.endpointCount} of 10 endpoints
                                available
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    {showProbeColumn && (
                      <TableCell>
                        {row.probe ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  {row.probe.rpcReachable ? (
                                    <>
                                      <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
                                      <span className="text-sm font-mono">
                                        {row.probe.latencyMs}ms
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                                      <span className="text-sm text-muted-foreground">
                                        Unreachable
                                      </span>
                                    </>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs space-y-1">
                                  <p>
                                    Status:{" "}
                                    {row.probe.rpcReachable
                                      ? "Healthy"
                                      : "Unreachable"}
                                  </p>
                                  {row.probe.latencyMs && (
                                    <p>Latency: {row.probe.latencyMs}ms</p>
                                  )}
                                  {row.probe.rpcVersion && (
                                    <p>RPC Version: {row.probe.rpcVersion}</p>
                                  )}
                                  {row.probe.error && (
                                    <p className="text-destructive">
                                      Error: {row.probe.error}
                                    </p>
                                  )}
                                  <p className="text-muted-foreground">
                                    Probed:{" "}
                                    {new Date(
                                      row.probe.probedAt
                                    ).toLocaleTimeString()}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-sm">Not probed</span>
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {row.endpoints.rpc && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={`http://${row.endpoints.rpc}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded hover:bg-muted"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Open RPC endpoint</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Link
                          href={`/pnodes/${row.pubkey}`}
                          className="p-1.5 rounded hover:bg-muted inline-flex items-center gap-1 text-sm text-primary"
                        >
                          Details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

