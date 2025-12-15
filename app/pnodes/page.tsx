import { Suspense } from "react";
import { getSnapshot } from "@/lib/pnodes/service";
import { PnodeDirectory } from "./_features";
import { MetricCardSkeleton } from "@/components/shared/MetricCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function PnodesContent() {
	const snapshot = await getSnapshot();

	return <PnodeDirectory initialSnapshot={snapshot} />;
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
