"use client";

import { useState, useCallback } from "react";
import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { PnodeTable } from "./PnodeTable";
import { MetricCard } from "./MetricCard";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/hooks/useWatchlist";
import {
  Server,
  Radio,
  GitBranch,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
  Star,
} from "lucide-react";

interface PnodeDirectoryProps {
  initialSnapshot: SnapshotResponse;
}

interface ProbeStats {
  totalProbed: number;
  reachable: number;
  unreachable: number;
  avgLatencyMs: number | null;
  minLatencyMs: number | null;
  maxLatencyMs: number | null;
}

export function PnodeDirectory({ initialSnapshot }: PnodeDirectoryProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [probing, setProbing] = useState(false);
  const [probeStats, setProbeStats] = useState<ProbeStats | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);

  // Watchlist hook
  const { watchlist, toggle: toggleWatchlist, count: watchlistCount } = useWatchlist();

  const versions = Object.keys(snapshot.stats.versionDistribution).sort();

  const handleProbe = useCallback(async () => {
    setProbing(true);
    setProbeError(null);

    try {
      const res = await fetch("/api/pnodes/probe?force=true");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to probe pNodes");
      }

      const data = await res.json();

      // Update rows with probe results
      setSnapshot((prev) => ({
        ...prev,
        rows: data.rows as PnodeRow[],
      }));

      // Save probe stats
      setProbeStats(data.stats);
    } catch (err) {
      setProbeError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setProbing(false);
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stale data warning */}
      {snapshot.stale && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/20 text-chart-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Data may be outdated</p>
            <p className="text-sm opacity-80">
              Unable to fetch fresh data from pRPC. Showing cached results.
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {snapshot.errors && snapshot.errors.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error fetching data</p>
            <p className="text-sm opacity-80">{snapshot.errors.join(", ")}</p>
          </div>
        </div>
      )}

      {/* Probe error */}
      {probeError && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Probe failed</p>
            <p className="text-sm opacity-80">{probeError}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total pNodes"
          value={snapshot.stats.totalNodes}
          subtitle="In gossip network"
          icon={Server}
          delay={0}
        />
        <MetricCard
          title="With RPC"
          value={snapshot.stats.nodesWithRpc}
          subtitle={`${Math.round((snapshot.stats.nodesWithRpc / Math.max(snapshot.stats.totalNodes, 1)) * 100)}% of nodes`}
          icon={Radio}
          delay={50}
        />
        {probeStats ? (
          <>
            <MetricCard
              title="RPC Reachable"
              value={probeStats.reachable}
              subtitle={`${probeStats.unreachable} unreachable`}
              icon={Activity}
              delay={100}
            />
            <MetricCard
              title="Avg Latency"
              value={
                probeStats.avgLatencyMs ? `${probeStats.avgLatencyMs}ms` : "—"
              }
              subtitle={
                probeStats.minLatencyMs && probeStats.maxLatencyMs
                  ? `${probeStats.minLatencyMs}ms - ${probeStats.maxLatencyMs}ms`
                  : "No data"
              }
              icon={Zap}
              delay={150}
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Unique Versions"
              value={snapshot.stats.uniqueVersions}
              subtitle={`Modal: ${snapshot.stats.modalVersion ?? "—"}`}
              icon={GitBranch}
              delay={100}
            />
            <MetricCard
              title="Watchlist"
              value={watchlistCount}
              subtitle="Saved pNodes"
              icon={Star}
              delay={150}
            />
          </>
        )}
      </div>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">pNode Directory</h1>
          <p className="text-muted-foreground mt-1">
            All pNodes discovered via gossip from the Xandeum network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
            Live
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {snapshot.source.method}
          </Badge>
          {probeStats && (
            <Badge variant="outline" className="gap-1.5 text-chart-2 border-chart-2/30">
              <Activity className="h-3 w-3" />
              Probed
            </Badge>
          )}
          {watchlistCount > 0 && (
            <Badge variant="outline" className="gap-1.5 text-chart-3 border-chart-3/30">
              <Star className="h-3 w-3 fill-chart-3" />
              {watchlistCount} watched
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      <PnodeTable
        rows={snapshot.rows}
        modalVersion={snapshot.stats.modalVersion}
        versions={versions}
        showProbeColumn={probeStats !== null}
        probing={probing}
        onProbe={handleProbe}
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
        showWatchlistFilter={true}
      />
    </div>
  );
}
