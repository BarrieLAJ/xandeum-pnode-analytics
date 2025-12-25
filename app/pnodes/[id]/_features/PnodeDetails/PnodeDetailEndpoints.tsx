import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Radio, ExternalLink } from "lucide-react";

interface PnodeDetailEndpointsProps {
  node: PnodeRow;
}

export function PnodeDetailEndpoints({ node }: PnodeDetailEndpointsProps) {
  const endpoints = [
    { name: "Gossip", value: node.endpoints.gossip, icon: Network, description: "Node address" },
    { name: "pRPC", value: node.endpoints.rpc, icon: Radio, description: "pRPC endpoint (host:port)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Network Endpoints</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          pNodes expose a simplified endpoint structure compared to Solana validators
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {endpoints.map(({ name, value, icon: Icon, description }) => (
            <div
              key={name}
              className="flex flex-col gap-2 py-2 border-b border-border/50 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">{name}</span>
                  {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
              {value ? (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <code className="text-xs sm:text-sm font-mono text-muted-foreground break-all sm:break-normal">
                    {value}
                  </code>
                  <span className="shrink-0">
                    <CopyButton value={value} label={`Copy ${name}`} />
                  </span>
                  {name === "pRPC" && (
                    <a
                      href={`http://${value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-muted"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

