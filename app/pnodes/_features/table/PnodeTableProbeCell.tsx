"use client";

import { PnodeRow } from "@/lib/pnodes/model";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface PnodeTableProbeCellProps {
  row: PnodeRow;
}

export function PnodeTableProbeCell({ row }: PnodeTableProbeCellProps) {
  if (!row.probe) {
    return (
      <TableCell>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-sm">Not probed</span>
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {row.probe.rpcReachable ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-chart-2" />
                  <span className="text-sm font-mono">{row.probe.latencyMs}ms</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-sm text-muted-foreground">Unreachable</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p>Status: {row.probe.rpcReachable ? "Healthy" : "Unreachable"}</p>
              {row.probe.latencyMs && <p>Latency: {row.probe.latencyMs}ms</p>}
              {row.probe.rpcVersion && <p>RPC Version: {row.probe.rpcVersion}</p>}
              {row.probe.error && (
                <p className="text-destructive">Error: {row.probe.error}</p>
              )}
              <p className="text-muted-foreground">
                Probed: {new Date(row.probe.probedAt).toLocaleTimeString()}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
}

