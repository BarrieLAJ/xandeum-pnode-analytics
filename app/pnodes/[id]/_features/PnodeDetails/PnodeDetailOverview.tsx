import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Hash, Code } from "lucide-react";
import { PnodeDetailNetworkContext } from "./PnodeDetailNetworkContext";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Software Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {node.version ?? "Unknown"}
            </p>
            {snapshot.stats.modalVersion && (
              <p className="text-sm text-muted-foreground mt-1">
                {node.version === snapshot.stats.modalVersion
                  ? "Running the most common version"
                  : `Modal version: ${snapshot.stats.modalVersion}`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Shred Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {node.shredVersion ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Consensus protocol version
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Code className="h-4 w-4" />
              Feature Set
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {node.featureSet ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Enabled feature flags
            </p>
          </CardContent>
        </Card>
      </div>

      <PnodeDetailNetworkContext snapshot={snapshot} />
    </div>
  );
}
