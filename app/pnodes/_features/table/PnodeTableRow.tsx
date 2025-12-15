"use client";

import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { WatchlistButton } from "../WatchlistButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Server, Globe, Radio } from "lucide-react";
import { PnodeTableProbeCell } from "./PnodeTableProbeCell";
import { PnodeTableActionsCell } from "./PnodeTableActionsCell";

interface PnodeTableRowProps {
  row: PnodeRow;
  modalVersion: string | null;
  showProbeColumn: boolean;
  isWatched: boolean;
  onToggleWatchlist?: (pubkey: string) => void;
}

export function PnodeTableRow({
  row,
  modalVersion,
  showProbeColumn,
  isWatched,
  onToggleWatchlist,
}: PnodeTableRowProps) {
  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-2">
          {onToggleWatchlist && (
            <WatchlistButton
              pubkey={row.pubkey}
              isWatched={isWatched}
              onToggle={onToggleWatchlist}
            />
          )}
          <div className="p-1.5 rounded bg-primary/10 text-primary">
            <Server className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <code className="text-sm font-mono">{row.derived.shortPubkey}</code>
          </div>
          <CopyButton value={row.pubkey} label="Copy pubkey" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-sm">
            {row.derived.ipAddress ?? "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <VersionBadge version={row.version} modalVersion={modalVersion} />
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Radio
                  className={cn(
                    "h-3.5 w-3.5",
                    row.derived.hasRpc ? "text-chart-2" : "text-muted-foreground"
                  )}
                />
                <span className="text-sm">{row.derived.endpointCount}/10</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>RPC: {row.derived.hasRpc ? "Yes" : "No"}</p>
                <p>Pubsub: {row.derived.hasPubsub ? "Yes" : "No"}</p>
                <p>{row.derived.endpointCount} of 10 endpoints available</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      {showProbeColumn && <PnodeTableProbeCell row={row} />}
      <PnodeTableActionsCell row={row} />
    </TableRow>
  );
}
