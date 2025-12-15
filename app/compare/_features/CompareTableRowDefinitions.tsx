"use client";

import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { CheckCircle, XCircle } from "lucide-react";
import { CompareTableRow } from "./CompareTableRow";

interface CompareTableRowDefinitionsProps {
  selectedNodes: PnodeRow[];
  snapshot: SnapshotResponse;
}

export function CompareTableRowDefinitions({
  selectedNodes,
  snapshot,
}: CompareTableRowDefinitionsProps) {
  return (
    <>
      <CompareTableRow
        label="Full Pubkey"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <code className="text-xs break-all">{node.pubkey}</code>
        )}
      />
      <CompareTableRow
        label="Version"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <VersionBadge
            version={node.version}
            modalVersion={snapshot.stats.modalVersion}
          />
        )}
      />
      <CompareTableRow
        label="Shred Version"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">{node.shredVersion ?? "—"}</span>
        )}
      />
      <CompareTableRow
        label="Feature Set"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">{node.featureSet ?? "—"}</span>
        )}
      />
      <CompareTableRow
        label="IP Address"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">{node.derived.ipAddress ?? "—"}</span>
        )}
      />
      <CompareTableRow
        label="RPC Endpoint"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.derived.hasRpc ? (
            <div className="flex items-center gap-2 text-chart-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Available</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Not available</span>
            </div>
          )
        }
      />
      <CompareTableRow
        label="Pubsub Endpoint"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.derived.hasPubsub ? (
            <div className="flex items-center gap-2 text-chart-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Available</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Not available</span>
            </div>
          )
        }
      />
      <CompareTableRow
        label="Total Endpoints"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">{node.derived.endpointCount}/10</span>
        )}
      />
      <CompareTableRow
        label="RPC Address"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.endpoints.rpc ? (
            <code className="text-xs">{node.endpoints.rpc}</code>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
      />
      <CompareTableRow
        label="Gossip Address"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.endpoints.gossip ? (
            <code className="text-xs">{node.endpoints.gossip}</code>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
      />
    </>
  );
}

