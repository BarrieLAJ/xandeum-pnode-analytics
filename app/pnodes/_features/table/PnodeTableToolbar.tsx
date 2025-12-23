"use client";

import { Button } from "@/components/ui/button";
import { Radio, Loader2, Download } from "lucide-react";

interface PnodeTableToolbarProps {
	filteredCount: number;
	totalCount: number;
	hasActiveFilters: boolean;
	onClearFilters: () => void;
	onProbe?: () => void;
	probing?: boolean;
	onExport: () => void;
}

export function PnodeTableToolbar({
	filteredCount,
	totalCount,
	hasActiveFilters,
	onClearFilters,
	onProbe,
	probing = false,
	onExport,
}: PnodeTableToolbarProps) {
	return (
		<div className="flex items-center justify-between text-sm text-muted-foreground">
			<span>
				{filteredCount === totalCount ? (
					<>Total: {totalCount} pNodes</>
				) : (
					<>
						{filteredCount} of {totalCount} pNodes
						{hasActiveFilters && " (filtered)"}
					</>
				)}
			</span>
			<div className="flex items-center gap-2">
				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={onClearFilters}>
						Clear filters
					</Button>
				)}
				{onProbe && (
					<Button
						variant="outline"
						size="sm"
						onClick={onProbe}
						disabled={probing}
						className="gap-2"
					>
						{probing ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Probing...
							</>
						) : (
							<>
								<Radio className="h-3.5 w-3.5" />
								Test RPC Health
							</>
						)}
					</Button>
				)}
				<Button variant="outline" size="sm" onClick={onExport} className="gap-2">
					<Download className="h-3.5 w-3.5" />
					Export CSV
				</Button>
			</div>
		</div>
	);
}
