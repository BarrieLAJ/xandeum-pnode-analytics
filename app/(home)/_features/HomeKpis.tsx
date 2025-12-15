import { SnapshotResponse } from "@/lib/pnodes/model";
import { MetricCard } from "@/components/shared/MetricCard";
import { Server, Radio, GitBranch, Clock } from "lucide-react";

interface HomeKpisProps {
  snapshot: SnapshotResponse;
}

export function HomeKpis({ snapshot }: HomeKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total pNodes"
        value={snapshot.stats.totalNodes}
        subtitle="Active in gossip network"
        icon={Server}
        delay={0}
      />
      <MetricCard
        title="RPC Enabled"
        value={snapshot.stats.nodesWithRpc}
        subtitle={`${Math.round((snapshot.stats.nodesWithRpc / Math.max(snapshot.stats.totalNodes, 1)) * 100)}% have RPC`}
        icon={Radio}
        delay={50}
      />
      <MetricCard
        title="Software Versions"
        value={snapshot.stats.uniqueVersions}
        subtitle={`Modal: ${snapshot.stats.modalVersion ?? "—"}`}
        icon={GitBranch}
        delay={100}
      />
      <MetricCard
        title="Data Freshness"
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
  );
}

