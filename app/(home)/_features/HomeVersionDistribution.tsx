import { SnapshotResponse } from "@/lib/pnodes/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

interface HomeVersionDistributionProps {
  snapshot: SnapshotResponse;
}

export function HomeVersionDistribution({ snapshot }: HomeVersionDistributionProps) {
  const versionEntries = Object.entries(snapshot.stats.versionDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxVersionCount = Math.max(
    ...Object.values(snapshot.stats.versionDistribution)
  );

  return (
    <Card className="animate-fade-in stagger-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Version Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versionEntries.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No version data available
          </p>
        ) : (
          versionEntries.map(([version, count]) => {
            const percentage = (count / maxVersionCount) * 100;
            const isModal = version === snapshot.stats.modalVersion;
            return (
              <div key={version} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <code className="font-mono">{version}</code>
                    {isModal && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5"
                      >
                        Modal
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {count} nodes (
                    {Math.round(
                      (count / snapshot.stats.totalNodes) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

