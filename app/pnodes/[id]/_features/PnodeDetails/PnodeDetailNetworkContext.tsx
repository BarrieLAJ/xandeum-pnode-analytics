import { SnapshotResponse } from "@/lib/pnodes/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDurationSeconds } from "@/lib/utils";

interface PnodeDetailNetworkContextProps {
  snapshot: SnapshotResponse;
}

export function PnodeDetailNetworkContext({
  snapshot,
}: PnodeDetailNetworkContextProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Network Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Nodes</p>
            <p className="font-medium">{snapshot.stats.totalNodes}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Public Nodes</p>
            <p className="font-medium">
              {snapshot.stats.publicPods ?? snapshot.stats.nodesWithRpc}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Unique Versions</p>
            <p className="font-medium">{snapshot.stats.uniqueVersions}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">
              {new Date(snapshot.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
          <div>
            <p className="text-muted-foreground">Total Committed</p>
            <p className="font-medium">
              {formatBytes(snapshot.stats.totalStorageCommittedBytes)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Used</p>
            <p className="font-medium">
              {formatBytes(snapshot.stats.totalStorageUsedBytes)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Uptime</p>
            <p className="font-medium">
              {formatDurationSeconds(snapshot.stats.avgUptimeSeconds ?? undefined)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Source</p>
            <p className="font-medium font-mono">{snapshot.source.method}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

