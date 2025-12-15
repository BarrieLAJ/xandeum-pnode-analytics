import { SnapshotResponse } from "@/lib/pnodes/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <p className="text-muted-foreground">With RPC</p>
            <p className="font-medium">{snapshot.stats.nodesWithRpc}</p>
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
      </CardContent>
    </Card>
  );
}

