import { Suspense } from "react";
import { getSnapshot } from "@/lib/pnodes/service";
import { MetricCardSkeleton } from "@/components/shared/MetricCard";
import {
  GeoDistribution,
  WorldMap,
  HomeHero,
  HomeKpis,
  HomeVersionDistribution,
  HomeNetworkHealth,
  HomeQuickActions,
  HomeStaleWarning,
} from "./_features";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function OverviewContent() {
  const snapshot = await getSnapshot();

  return (
    <div className="space-y-10 animate-fade-in">
      <HomeHero />

      <HomeStaleWarning stale={snapshot.stale} />

      <HomeKpis snapshot={snapshot} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HomeVersionDistribution snapshot={snapshot} />
        <HomeNetworkHealth snapshot={snapshot} />
      </div>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorldMap />
        <GeoDistribution />
      </div>

      <HomeQuickActions />
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
