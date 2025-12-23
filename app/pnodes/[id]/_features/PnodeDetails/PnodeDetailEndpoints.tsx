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
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
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
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-muted-foreground">
                    {value}
                  </code>
                  <CopyButton value={value} label={`Copy ${name}`} />
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

