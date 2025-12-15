import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Network, Radio, Server, ExternalLink } from "lucide-react";

interface PnodeDetailEndpointsProps {
  node: PnodeRow;
}

export function PnodeDetailEndpoints({ node }: PnodeDetailEndpointsProps) {
  const endpoints = [
    { name: "Gossip", value: node.endpoints.gossip, icon: Network },
    { name: "RPC", value: node.endpoints.rpc, icon: Radio },
    { name: "Pubsub", value: node.endpoints.pubsub, icon: Globe },
    { name: "TPU", value: node.endpoints.tpu, icon: Server },
    { name: "TPU Forwards", value: node.endpoints.tpuForwards, icon: Server },
    { name: "TPU QUIC", value: node.endpoints.tpuQuic, icon: Server },
    { name: "TPU Forwards QUIC", value: node.endpoints.tpuForwardsQuic, icon: Server },
    { name: "TPU Vote", value: node.endpoints.tpuVote, icon: Server },
    { name: "TVU", value: node.endpoints.tvu, icon: Server },
    { name: "Serve Repair", value: node.endpoints.serveRepair, icon: Server },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Network Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {endpoints.map(({ name, value, icon: Icon }) => (
            <div
              key={name}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{name}</span>
              </div>
              {value ? (
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-muted-foreground">
                    {value}
                  </code>
                  <CopyButton value={value} label={`Copy ${name}`} />
                  {name === "RPC" && (
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

