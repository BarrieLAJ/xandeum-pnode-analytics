"use client";

import { useState, useCallback } from "react";
import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { CompareHeader } from "./CompareHeader";
import { CompareNodeSelector } from "./CompareNodeSelector";
import { CompareEmptyState } from "./CompareEmptyState";
import { CompareTable } from "./CompareTable";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Server } from "lucide-react";

interface CompareClientProps {
	initialSnapshot: SnapshotResponse;
}

export function CompareClient({ initialSnapshot }: CompareClientProps) {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [search, setSearch] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);

	const addNode = useCallback(
		(pubkey: string) => {
			setSelectedIds((prev) => {
				if (prev.includes(pubkey) || prev.length >= 4) return prev;
				const newIds = [...prev, pubkey];
				// Close drawer if we've reached max selection
				if (newIds.length >= 4) {
					setDrawerOpen(false);
				}
				return newIds;
			});
		},
		[]
	);

	const removeNode = useCallback((pubkey: string) => {
		setSelectedIds((prev) => prev.filter((id) => id !== pubkey));
	}, []);

	const selectedNodes: PnodeRow[] =
		initialSnapshot.rows.filter((row) => selectedIds.includes(row.pubkey)) ?? [];

	const isMaxSelected = selectedIds.length >= 4;

	return (
		<div className="space-y-6 animate-fade-in">
			<CompareHeader selectedCount={selectedIds.length} />

			{/* Compact selection header */}
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div className="flex items-center gap-2 flex-wrap">
						{selectedNodes.length > 0 ? (
							<>
								<span className="text-sm text-muted-foreground">Selected:</span>
								{selectedNodes.map((node) => (
									<Badge
										key={node.pubkey}
										variant="secondary"
										className="gap-2 pr-1"
									>
										<Server className="h-3 w-3" />
										<code className="text-xs">{node.derived.shortPubkey}</code>
										<button
											onClick={() => removeNode(node.pubkey)}
											className="p-0.5 rounded hover:bg-muted"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</>
						) : (
							<span className="text-sm text-muted-foreground">
								No pNodes selected
							</span>
						)}
					</div>

					<Drawer
						open={drawerOpen}
						onOpenChange={setDrawerOpen}
						direction="right"
					>
						<DrawerTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								disabled={isMaxSelected}
							>
								<Plus className="h-4 w-4" />
								{isMaxSelected ? "Max selected" : "Add pNode"}
							</Button>
						</DrawerTrigger>
						<CompareNodeSelector
							search={search}
							onSearchChange={setSearch}
							allNodes={initialSnapshot.rows}
							selectedIds={selectedIds}
							onAddNode={addNode}
						/>
					</Drawer>
				</div>

				{isMaxSelected && (
					<div className="text-sm text-muted-foreground">
						Maximum of 4 pNodes can be compared at once. Remove one to add another.
					</div>
				)}
			</div>

			{selectedNodes.length === 0 ? (
				<CompareEmptyState />
			) : (
				<CompareTable selectedNodes={selectedNodes} snapshot={initialSnapshot} />
			)}
		</div>
	);
}
