import { Suspense } from "react";
import { getSnapshot } from "@/lib/pnodes/service";
import { CompareClient } from "./_features";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function CompareSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-8 w-48 bg-muted animate-pulse rounded" />
			<div className="h-4 w-72 bg-muted animate-pulse rounded" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{[...Array(2)].map((_, i) => (
					<div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
				))}
			</div>
		</div>
	);
}

async function CompareContent() {
	const snapshot = await getSnapshot();
	return <CompareClient initialSnapshot={snapshot} />;
}

export default function ComparePage() {
	return (
		<Suspense fallback={<CompareSkeleton />}>
			<CompareContent />
		</Suspense>
	);
}
