import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPnodeById, getSnapshot } from "@/lib/pnodes/service";
import {
	PnodeDetailHeader,
	PnodeDetailOverview,
} from "./_features";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
	params: Promise<{ id: string }>;
}

async function PnodeDetailContent({ pubkey }: { pubkey: string }) {
	const [node, snapshot] = await Promise.all([
		getPnodeById(pubkey),
		getSnapshot(),
	]);

	if (!node) {
		notFound();
	}

	return (
		<div className="space-y-8 animate-fade-in">
			<PnodeDetailHeader node={node} snapshot={snapshot} />

			<PnodeDetailOverview node={node} snapshot={snapshot} />
		</div>
	);
}

function PnodeDetailLoading() {
	return (
		<div className="space-y-8">
			<div className="h-4 w-32 bg-muted animate-pulse rounded" />
			<div className="space-y-4">
				<div className="h-8 w-48 bg-muted animate-pulse rounded" />
				<div className="h-6 w-96 bg-muted animate-pulse rounded" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
				))}
			</div>
		</div>
	);
}

export default async function PnodeDetailPage({ params }: PageProps) {
	const { id } = await params;

	return (
		<Suspense fallback={<PnodeDetailLoading />}>
			<PnodeDetailContent pubkey={id} />
		</Suspense>
	);
}
