import { SnapshotResponse } from "@/lib/pnodes/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Globe, Radio, TrendingUp } from "lucide-react";

interface HomeNetworkHealthProps {
  snapshot: SnapshotResponse;
}

export function HomeNetworkHealth({ snapshot }: HomeNetworkHealthProps) {
  return (
    <Card className="animate-fade-in stagger-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Network Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health indicators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-chart-2" />
              <div>
                <p className="font-medium">Gossip Network</p>
                <p className="text-sm text-muted-foreground">
                  All nodes responding
                </p>
              </div>
            </div>
            <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">
              Healthy
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">RPC Coverage</p>
                <p className="text-sm text-muted-foreground">
                  {snapshot.stats.nodesWithRpc} of{" "}
                  {snapshot.stats.totalNodes} nodes
                </p>
              </div>
            </div>
            <span className="text-lg font-bold">
              {Math.round(
                (snapshot.stats.nodesWithRpc /
                  Math.max(snapshot.stats.totalNodes, 1)) *
                  100
              )}
              %
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Pubsub Enabled</p>
                <p className="text-sm text-muted-foreground">
                  {snapshot.stats.nodesWithPubsub} of{" "}
                  {snapshot.stats.totalNodes} nodes
                </p>
              </div>
            </div>
            <span className="text-lg font-bold">
              {Math.round(
                (snapshot.stats.nodesWithPubsub /
                  Math.max(snapshot.stats.totalNodes, 1)) *
                  100
              )}
              %
            </span>
          </div>
        </div>

        {/* Data source info */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Data source:{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted">
              {snapshot.source.method}
            </code>{" "}
            via{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted">
              {new URL(snapshot.source.prpcUrl).hostname}
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

