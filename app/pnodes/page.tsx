import { Suspense } from "react";
import { getSnapshot } from "@/lib/pnodes/service";
import { PnodeTable } from "@/components/app/PnodeTable";
import { MetricCard, MetricCardSkeleton } from "@/components/app/MetricCard";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Radio,
  GitBranch,
  Clock,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function PnodesContent() {
  const snapshot = await getSnapshot();

  const versions = Object.keys(snapshot.stats.versionDistribution).sort();

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
        <MetricCard
          title="Unique Versions"
          value={snapshot.stats.uniqueVersions}
          subtitle={`Modal: ${snapshot.stats.modalVersion ?? "—"}`}
          icon={GitBranch}
          delay={100}
        />
        <MetricCard
          title="Last Updated"
          value={new Date(snapshot.generatedAt).toLocaleTimeString()}
          subtitle={
            snapshot.fetchDurationMs
              ? `Fetched in ${snapshot.fetchDurationMs.toFixed(0)}ms`
              : "From cache"
          }
          icon={Clock}
          delay={150}
        />
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
        </div>
      </div>

      {/* Table */}
      <PnodeTable
        rows={snapshot.rows}
        modalVersion={snapshot.stats.modalVersion}
        versions={versions}
      />
    </div>
  );
}

function PnodesLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded" />
      </div>
      <div className="rounded-lg border border-border/50 bg-card p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PnodesPage() {
  return (
    <Suspense fallback={<PnodesLoading />}>
      <PnodesContent />
    </Suspense>
  );
}

