import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Server,
  Globe,
  Clock,
  Code,
  Database,
  Shield,
  ExternalLink,
  GitBranch,
  Radio,
  Info,
} from "lucide-react";

export const metadata = {
  title: "About | Xandeum pNode Analytics",
  description:
    "Learn about how Xandeum pNode Analytics works, data sources, and methodology.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            About This Dashboard
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A real-time dashboard for monitoring Xandeum pNodes, similar to validator dashboards for Solana.
        </p>
      </div>

      {/* What is Xandeum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            What is Xandeum?
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            <strong>Xandeum</strong> is building a scalable storage layer for Solana dApps. Think of it as a second tier of Solana accounts that can grow to exabytes and beyond.
          </p>
          <p>
            This storage layer runs on its own network of storage provider nodes, called <strong>pNodes</strong>. These nodes use the gossip protocol to announce their availability and capabilities.
          </p>
          <div className="flex gap-2 mt-4 not-prose">
            <Badge variant="outline" className="gap-1.5">
              <ExternalLink className="h-3 w-3" />
              <a
                href="https://xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
              >
                xandeum.network
              </a>
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <ExternalLink className="h-3 w-3" />
              <a
                href="https://discord.gg/uqRSmmM5m"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Source & Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">pRPC Endpoint</h4>
            <p className="text-sm text-muted-foreground">
              All data comes from the Xandeum devnet pRPC endpoint using standard JSON-RPC 2.0 (compatible with Solana tooling).
            </p>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
              <code>https://api.devnet.xandeum.com:8899/</code>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">How We Discover Nodes</h4>
            <p className="text-sm text-muted-foreground">
              We query multiple seed pNodes using the <code className="px-1 py-0.5 rounded bg-muted">get-pods-with-stats</code> method to discover all pNodes currently active in the gossip network. This gives us comprehensive data about each node's status, capabilities, and metrics.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">What Data We Get</h4>
            <p className="text-sm text-muted-foreground">
              Each pNode includes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">pubkey</p>
                  <p className="text-muted-foreground">Unique node identifier</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <GitBranch className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">version</p>
                  <p className="text-muted-foreground">Software version</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Radio className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">endpoints</p>
                  <p className="text-muted-foreground">
                    RPC, gossip, TPU, TVU, etc.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">storage stats</p>
                  <p className="text-muted-foreground">
                    Used and committed storage
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Code className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">system metrics</p>
                  <p className="text-muted-foreground">CPU, RAM, network, streams</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">credits</p>
                  <p className="text-muted-foreground">Node credits from Xandeum API</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Caching & Refresh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We cache data to keep things fast and reduce load on the network:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50">
              <p className="font-medium mb-1">Snapshot Cache</p>
              <p className="text-sm text-muted-foreground">
                Full pNode list cached for <strong>30 seconds</strong> (configurable)
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <p className="font-medium mb-1">Node Details Cache</p>
              <p className="text-sm text-muted-foreground">
                Individual node data cached for <strong>60 seconds</strong>
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <p className="font-medium mb-1">Geo Lookup Cache</p>
              <p className="text-sm text-muted-foreground">
                IP geolocation results cached for <strong>24 hours</strong>
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <p className="font-medium mb-1">Historical Data</p>
              <p className="text-sm text-muted-foreground">
                Optional database storage for tracking network trends over time
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            If the pRPC endpoint is unreachable, you'll see cached data with a warning. The dashboard queries multiple seed nodes in parallel for better reliability.
          </p>
        </CardContent>
      </Card>

      {/* Metrics Explained */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Metrics Explained
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <p className="font-medium">Total pNodes</p>
              <p className="text-sm text-muted-foreground">
                The number of unique pNodes found in the gossip network across all seed nodes.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-medium">Public pNodes</p>
              <p className="text-sm text-muted-foreground">
                Nodes that have a publicly reachable RPC endpoint and can accept JSON-RPC requests.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-medium">Storage Committed</p>
              <p className="text-sm text-muted-foreground">
                Total storage capacity committed across all pNodes in the network.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-medium">Average Uptime</p>
              <p className="text-sm text-muted-foreground">
                Average uptime across all pNodes, calculated from their reported uptime values.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-medium">Version Distribution</p>
              <p className="text-sm text-muted-foreground">
                Shows which software versions are running across all pNodes. The modal version is the most common one.
              </p>
            </div>
            <div>
              <p className="font-medium">System Metrics</p>
              <p className="text-sm text-muted-foreground">
                Individual node metrics including CPU usage, RAM consumption, network traffic, and active stream counts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Next.js 16</Badge>
            <Badge variant="secondary">React 19</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind CSS v4</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
            <Badge variant="secondary">Zod</Badge>
            <Badge variant="secondary">Lucide Icons</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Useful Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://xandeum.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  Xandeum Website
                </p>
                <p className="text-sm text-muted-foreground">
                  Learn more about Xandeum
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
            </a>
            <a
              href="https://discord.gg/uqRSmmM5m"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <Server className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  Xandeum Discord
                </p>
                <p className="text-sm text-muted-foreground">
                  Join the community
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
            </a>
            <a
              href="https://explorer.xandeum.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  Xandeum Explorer
                </p>
                <p className="text-sm text-muted-foreground">
                  Blockchain explorer
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
            </a>
            <Link
              href="/pnodes"
              className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <Server className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">
                  pNode Directory
                </p>
                <p className="text-sm text-muted-foreground">
                  View all pNodes
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

