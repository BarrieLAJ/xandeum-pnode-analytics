"use client";

import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { CheckCircle, XCircle } from "lucide-react";
import { CompareTableRow } from "./CompareTableRow";
import { formatBytes, formatDurationSeconds, formatDate } from "@/lib/utils";

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
        label="IP Address"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">{node.derived.ipAddress ?? "—"}</span>
        )}
      />
      <CompareTableRow
        label="Public Status"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.pod?.isPublic ? (
            <div className="flex items-center gap-2 text-chart-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Public</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Private</span>
            </div>
          )
        }
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
        label="pRPC URL"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.pod?.prpcUrl ? (
            <code className="text-xs break-all">{node.pod.prpcUrl}</code>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
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
      <CompareTableRow
        label="Storage Used"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">
            {formatBytes(node.pod?.storageUsedBytes)}
          </span>
        )}
      />
      <CompareTableRow
        label="Storage Committed"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">
            {formatBytes(node.pod?.storageCommittedBytes)}
          </span>
        )}
      />
      <CompareTableRow
        label="Storage Usage %"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">
            {node.pod?.storageUsagePercent !== undefined
              ? `${node.pod.storageUsagePercent.toFixed(1)}%`
              : "—"}
          </span>
        )}
      />
      <CompareTableRow
        label="Uptime"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) => (
          <span className="font-mono">
            {formatDurationSeconds(node.pod?.uptimeSeconds)}
          </span>
        )}
      />
      <CompareTableRow
        label="Last Seen"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.pod?.lastSeenTimestamp ? (
            <span className="text-xs">
              {formatDate(node.pod.lastSeenTimestamp * 1000)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
      />
      <CompareTableRow
        label="Credits"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.pod?.credits !== undefined && node.pod.credits !== null ? (
            <span className="font-mono">
              {node.pod.credits.toLocaleString()}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
      />
      <CompareTableRow
        label="pRPC Port"
        selectedNodes={selectedNodes}
        snapshot={snapshot}
        renderCell={(node) =>
          node.pod?.prpcPort ? (
            <span className="font-mono">{node.pod.prpcPort}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        }
      />
    </>
  );
}

