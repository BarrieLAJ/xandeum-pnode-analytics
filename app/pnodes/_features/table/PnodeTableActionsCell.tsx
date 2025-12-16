"use client";

import Link from "next/link";
import { PnodeRow } from "@/lib/pnodes/model";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell } from "@/components/ui/table";
import { ChevronRight, ExternalLink } from "lucide-react";

interface PnodeTableActionsCellProps {
  row: PnodeRow;
}

export function PnodeTableActionsCell({ row }: PnodeTableActionsCellProps) {
  const prpcUrl = row.pod?.prpcUrl ?? (row.endpoints.rpc ? `http://${row.endpoints.rpc}/rpc` : null);
  return (
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {prpcUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={prpcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-muted"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Open pRPC endpoint</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Link
          href={`/pnodes/${row.pubkey}`}
          className="p-1.5 rounded hover:bg-muted inline-flex items-center gap-1 text-sm text-primary"
        >
          Details
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </TableCell>
  );
}

