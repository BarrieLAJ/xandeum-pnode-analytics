"use client";

import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

type SortField = "pubkey" | "version" | "ip" | "endpointCount" | "latency";

interface PnodeTableHeaderProps {
  sortField: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
  showProbeColumn: boolean;
}

const SortableHeader = ({
  field,
  currentField,
  currentOrder,
  onSort,
  children,
}: {
  field: SortField;
  currentField: SortField;
  currentOrder: "asc" | "desc";
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

export function PnodeTableHeader({
  sortField,
  sortOrder,
  onSort,
  showProbeColumn,
}: PnodeTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableHead className="w-[300px]">
          <SortableHeader
            field="pubkey"
            currentField={sortField}
            currentOrder={sortOrder}
            onSort={onSort}
          >
            Pubkey
          </SortableHeader>
        </TableHead>
        <TableHead>
          <SortableHeader
            field="ip"
            currentField={sortField}
            currentOrder={sortOrder}
            onSort={onSort}
          >
            IP Address
          </SortableHeader>
        </TableHead>
        <TableHead>
          <SortableHeader
            field="version"
            currentField={sortField}
            currentOrder={sortOrder}
            onSort={onSort}
          >
            Version
          </SortableHeader>
        </TableHead>
        <TableHead>
          <SortableHeader
            field="endpointCount"
            currentField={sortField}
            currentOrder={sortOrder}
            onSort={onSort}
          >
            Endpoints
          </SortableHeader>
        </TableHead>
        {showProbeColumn && (
          <TableHead>
            <SortableHeader
              field="latency"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={onSort}
            >
              RPC Health
            </SortableHeader>
          </TableHead>
        )}
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

