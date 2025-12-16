import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Database, Timer, Globe } from "lucide-react";
import { PnodeDetailNetworkContext } from "./PnodeDetailNetworkContext";
import { PnodeDetailSystemStats } from "./PnodeDetailSystemStats";
import { formatBytes, formatDurationSeconds, truncateVersion } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PnodeDetailOverviewProps {
  node: PnodeRow;
  snapshot: SnapshotResponse;
}

export function PnodeDetailOverview({
  node,
  snapshot,
}: PnodeDetailOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Software Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-2xl font-bold font-mono cursor-help">
                    {node.version ? truncateVersion(node.version, 15) : "Unknown"}
                  </p>
                </TooltipTrigger>
                {node.version && (
                  <TooltipContent>
                    <p>Full version: {node.version}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            {snapshot.stats.modalVersion && (
              <p className="text-sm text-muted-foreground mt-1">
                {node.version === snapshot.stats.modalVersion
                  ? "Running the most common version"
                  : `Modal version: ${truncateVersion(snapshot.stats.modalVersion, 15)}`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {formatBytes(node.pod?.storageUsedBytes)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Committed: {formatBytes(node.pod?.storageCommittedBytes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Uptime / Last seen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {formatDurationSeconds(node.pod?.uptimeSeconds)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {node.pod?.lastSeenTimestamp
                ? `Last seen: ${new Date(
                    node.pod.lastSeenTimestamp * 1000
                  ).toLocaleString()}`
                : "Last seen: —"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {node.pod?.isPublic ? "Yes" : "No"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              pRPC: {node.pod?.prpcUrl ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live (on-demand) pRPC stats */}
      <PnodeDetailSystemStats pubkey={node.pubkey} />

      <PnodeDetailNetworkContext snapshot={snapshot} />
    </div>
  );
}
