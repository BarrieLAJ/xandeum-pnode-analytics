import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPnodeById, getSnapshot } from "@/lib/pnodes/service";
import { CopyButton } from "@/components/app/CopyButton";
import { VersionBadge } from "@/components/app/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Server,
  Globe,
  Radio,
  GitBranch,
  Hash,
  Network,
  ExternalLink,
  Code,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function PnodeDetailContent({ pubkey }: { pubkey: string }) {
  const [node, snapshot] = await Promise.all([
    getPnodeById(pubkey),
    getSnapshot(),
  ]);

  if (!node) {
    notFound();
  }

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
    <div className="space-y-8 animate-fade-in">
      {/* Back link */}
      <Link
        href="/pnodes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">pNode Details</h1>
              <p className="text-muted-foreground">
                Detailed information about this storage provider node
              </p>
            </div>
          </div>

          {/* Pubkey */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 w-fit">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <code className="text-sm font-mono">{node.pubkey}</code>
            <CopyButton value={node.pubkey} label="Copy pubkey" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-2">
          <VersionBadge
            version={node.version}
            modalVersion={snapshot.stats.modalVersion}
          />
          <Badge variant="outline" className="gap-1.5">
            <Globe className="h-3 w-3" />
            {node.derived.ipAddress ?? "Unknown IP"}
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Radio className="h-3 w-3" />
            {node.derived.endpointCount}/10 endpoints
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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

          {/* Network context */}
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
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
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
        </TabsContent>

        {/* Raw JSON Tab */}
        <TabsContent value="raw">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Raw JSON Response</CardTitle>
              <CopyButton
                value={JSON.stringify(node.raw, null, 2)}
                label="Copy JSON"
                variant="outline"
                size="sm"
              />
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <pre className="p-4 overflow-x-auto text-sm font-mono bg-muted/30 rounded-b-lg">
                {JSON.stringify(node.raw, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PnodeDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-96 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function PnodeDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<PnodeDetailLoading />}>
      <PnodeDetailContent pubkey={id} />
    </Suspense>
  );
}

