"use client";

import { useState, useCallback } from "react";
import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { CompareHeader } from "./CompareHeader";
import { CompareNodeSelector } from "./CompareNodeSelector";
import { CompareEmptyState } from "./CompareEmptyState";
import { CompareTable } from "./CompareTable";

interface CompareClientProps {
	initialSnapshot: SnapshotResponse;
}

export function CompareClient({ initialSnapshot }: CompareClientProps) {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [search, setSearch] = useState("");

	const addNode = useCallback((pubkey: string) => {
		setSelectedIds((prev) => {
			if (prev.includes(pubkey) || prev.length >= 4) return prev;
			return [...prev, pubkey];
		});
	}, []);

	const removeNode = useCallback((pubkey: string) => {
		setSelectedIds((prev) => prev.filter((id) => id !== pubkey));
	}, []);

	const selectedNodes: PnodeRow[] =
		initialSnapshot.rows.filter((row) => selectedIds.includes(row.pubkey)) ?? [];

	const filteredNodes =
		initialSnapshot.rows.filter(
			(row) =>
				!selectedIds.includes(row.pubkey) &&
				(search === "" ||
					row.pubkey.toLowerCase().includes(search.toLowerCase()) ||
					row.derived.ipAddress?.includes(search))
		) ?? [];

	return (
		<div className="space-y-8 animate-fade-in">
			<CompareHeader selectedCount={selectedIds.length} />

			<CompareNodeSelector
				search={search}
				onSearchChange={setSearch}
				filteredNodes={filteredNodes}
				selectedNodes={selectedNodes}
				selectedIds={selectedIds}
				onAddNode={addNode}
				onRemoveNode={removeNode}
			/>

			{selectedNodes.length === 0 ? (
				<CompareEmptyState />
			) : (
				<CompareTable selectedNodes={selectedNodes} snapshot={initialSnapshot} />
			)}
		</div>
	);
}
