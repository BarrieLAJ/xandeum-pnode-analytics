"use client";

import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

type SortField = "pubkey" | "version" | "public" | "storageUsed" | "credits";

interface PnodeTableHeaderProps {
	sortField: SortField;

	onSort: (field: SortField) => void;
}

const SortableHeader = ({
	field,
	currentField,
	onSort,
	children,
}: {
	field: SortField;
	currentField: SortField;
	onSort: (field: SortField) => void;
	children: React.ReactNode;
}) => (
	<Button
		variant="ghost"
		size="sm"
		className="-ml-3 h-8 gap-1 font-medium"
		onClick={() => onSort(field)}
	>
		{children}
		<ArrowUpDown
			className={cn(
				"h-3.5 w-3.5",
				currentField === field ? "text-primary" : "text-muted-foreground"
			)}
		/>
	</Button>
);

export function PnodeTableHeader({ sortField, onSort }: PnodeTableHeaderProps) {
	return (
		<TableHeader className="sticky top-0 z-10 bg-card">
			<TableRow className="bg-muted/50 hover:bg-muted/50 backdrop-blur-sm">
				<TableHead className="w-[280px]">
					<SortableHeader field="pubkey" currentField={sortField} onSort={onSort}>
						Pubkey
					</SortableHeader>
				</TableHead>
				<TableHead>
					<SortableHeader field="version" currentField={sortField} onSort={onSort}>
						Version
					</SortableHeader>
				</TableHead>
				<TableHead>
					<SortableHeader field="public" currentField={sortField} onSort={onSort}>
						Status
					</SortableHeader>
				</TableHead>
				<TableHead>
					<SortableHeader
						field="storageUsed"
						currentField={sortField}
						onSort={onSort}
					>
						Storage
					</SortableHeader>
				</TableHead>
				<TableHead>
					<SortableHeader field="credits" currentField={sortField} onSort={onSort}>
						Credits
					</SortableHeader>
				</TableHead>
				<TableHead className="text-right w-[100px]">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
}
