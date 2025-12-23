"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Cpu, MemoryStick, Activity } from "lucide-react";
import { useQuery } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { getPnodeStats } from "@/app/pnodes/_features/api";
import { formatBytes, formatDurationSeconds } from "@/lib/utils";

interface PnodeDetailSystemStatsProps {
  pubkey: string;
}

export function PnodeDetailSystemStats({ pubkey }: PnodeDetailSystemStatsProps) {
  const query = useQuery({
    queryKey: queryKeys.pnodes.stats(pubkey),
    queryFn: () => getPnodeStats(pubkey),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const stats = query.data?.stats;
  // Stats are at the top level (flat structure), not nested
  const cpu = stats?.cpu_percent;
  const ramUsed = stats?.ram_used;
  const ramTotal = stats?.ram_total;
  const uptime = stats?.uptime;
  const activeStreams = stats?.active_streams;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live System Stats (pRPC)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {query.data?.fromCache ? "Cached (~15s)" : "Live"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="gap-2"
        >
          {query.isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : query.error ? (
          <div className="text-sm text-destructive">
            Failed to load stats: {query.error.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">CPU</p>
                <p className="font-mono text-sm">
                  {cpu !== undefined ? `${cpu.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">RAM</p>
                <p className="font-mono text-sm">
                  {ramUsed !== undefined ? formatBytes(ramUsed) : "—"} /{" "}
                  {ramTotal !== undefined ? formatBytes(ramTotal) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Uptime (reported)</p>
                <p className="font-mono text-sm">
                  {uptime !== undefined ? formatDurationSeconds(uptime) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Active streams</p>
                <p className="font-mono text-sm">
                  {activeStreams !== undefined ? activeStreams : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


