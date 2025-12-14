import { Suspense } from "react";
import Link from "next/link";
import { getSnapshot } from "@/lib/pnodes/service";
import { MetricCard, MetricCardSkeleton } from "@/components/app/MetricCard";
import { GeoDistribution } from "@/components/app/GeoDistribution";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Server,
  Radio,
  GitBranch,
  Clock,
  ArrowRight,
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function OverviewContent() {
  const snapshot = await getSnapshot();

  // Calculate version distribution percentages
  const versionEntries = Object.entries(snapshot.stats.versionDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxVersionCount = Math.max(
    ...Object.values(snapshot.stats.versionDistribution)
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 md:p-12">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-2/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <span className="h-2 w-2 rounded-full bg-chart-2 animate-pulse mr-2" />
            Live Network Data
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Xandeum pNode Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Real-time monitoring and analytics for Xandeum&apos;s decentralized storage
            network. Track pNode health, version distribution, and network status.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/pnodes">
                View All pNodes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stale/Error warnings */}
      {snapshot.stale && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/20 text-chart-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Data may be outdated</p>
            <p className="text-sm opacity-80">
              Unable to fetch fresh data. Showing cached results.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Distribution */}
        <Card className="animate-fade-in stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Version Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {versionEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No version data available
              </p>
            ) : (
              versionEntries.map(([version, count]) => {
                const percentage = (count / maxVersionCount) * 100;
                const isModal = version === snapshot.stats.modalVersion;
                return (
                  <div key={version} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <code className="font-mono">{version}</code>
                        {isModal && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5"
                          >
                            Modal
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {count} nodes (
                        {Math.round(
                          (count / snapshot.stats.totalNodes) * 100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Network Health */}
        <Card className="animate-fade-in stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Network Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health indicators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-chart-2" />
                  <div>
                    <p className="font-medium">Gossip Network</p>
                    <p className="text-sm text-muted-foreground">
                      All nodes responding
                    </p>
                  </div>
                </div>
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">RPC Coverage</p>
                    <p className="text-sm text-muted-foreground">
                      {snapshot.stats.nodesWithRpc} of{" "}
                      {snapshot.stats.totalNodes} nodes
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {Math.round(
                    (snapshot.stats.nodesWithRpc /
                      Math.max(snapshot.stats.totalNodes, 1)) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Radio className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Pubsub Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      {snapshot.stats.nodesWithPubsub} of{" "}
                      {snapshot.stats.totalNodes} nodes
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {Math.round(
                    (snapshot.stats.nodesWithPubsub /
                      Math.max(snapshot.stats.totalNodes, 1)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>

            {/* Data source info */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Data source:{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted">
                  {snapshot.source.method}
                </code>{" "}
                via{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted">
                  {new URL(snapshot.source.prpcUrl).hostname}
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <GeoDistribution />

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/pnodes"
          className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Server className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            Browse Directory
          </h3>
          <p className="text-sm text-muted-foreground">
            View all pNodes with search, filter, and sort capabilities.
          </p>
        </Link>

        <Link
          href="/compare"
          className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <GitBranch className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            Compare Nodes
          </h3>
          <p className="text-sm text-muted-foreground">
            Side-by-side comparison of pNode configurations.
          </p>
        </Link>

        <Link
          href="/about"
          className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Globe className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            Methodology
          </h3>
          <p className="text-sm text-muted-foreground">
            Learn how data is collected and what metrics mean.
          </p>
        </Link>
      </div>
    </div>
  );
}

function OverviewLoading() {
  return (
    <div className="space-y-10">
      {/* Hero skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-12">
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="h-10 w-96 bg-muted animate-pulse rounded mb-4" />
        <div className="h-6 w-[600px] bg-muted animate-pulse rounded mb-8" />
        <div className="flex gap-4">
          <div className="h-12 w-40 bg-muted animate-pulse rounded" />
          <div className="h-12 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* KPI skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted animate-pulse rounded-xl" />
        <div className="h-80 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<OverviewLoading />}>
      <OverviewContent />
    </Suspense>
  );
}
