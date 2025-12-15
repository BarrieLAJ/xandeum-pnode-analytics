"use client";

import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { Server } from "lucide-react";
import { CompareTableRowDefinitions } from "./CompareTableRowDefinitions";

interface CompareTableProps {
  selectedNodes: PnodeRow[];
  snapshot: SnapshotResponse;
}

export function CompareTable({ selectedNodes, snapshot }: CompareTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 bg-muted/30 rounded-tl-lg font-medium text-muted-foreground">
              Property
            </th>
            {selectedNodes.map((node, i) => (
              <th
                key={node.pubkey}
                className={`text-left p-4 bg-muted/30 font-medium ${
                  i === selectedNodes.length - 1 ? "rounded-tr-lg" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <code className="text-sm">{node.derived.shortPubkey}</code>
                  <CopyButton value={node.pubkey} label="Copy pubkey" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <CompareTableRowDefinitions
            selectedNodes={selectedNodes}
            snapshot={snapshot}
          />
        </tbody>
      </table>
    </div>
  );
}
