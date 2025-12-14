"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/app/CopyButton";
import { VersionBadge } from "@/components/app/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Server,
  GitCompare,
  Plus,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function ComparePage() {
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Fetch snapshot
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/pnodes/snapshot");
        if (!res.ok) throw new Error("Failed to fetch pNodes");
        const data = await res.json();
        setSnapshot(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addNode = useCallback((pubkey: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(pubkey) || prev.length >= 4) return prev;
      return [...prev, pubkey];
    });
  }, []);

  const removeNode = useCallback((pubkey: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== pubkey));
  }, []);

  const selectedNodes: PnodeRow[] =
    snapshot?.rows.filter((row) => selectedIds.includes(row.pubkey)) ?? [];

  const filteredNodes =
    snapshot?.rows.filter(
      (row) =>
        !selectedIds.includes(row.pubkey) &&
        (search === "" ||
          row.pubkey.toLowerCase().includes(search.toLowerCase()) ||
          row.derived.ipAddress?.includes(search))
    ) ?? [];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load data</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

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
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <GitCompare className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Compare pNodes</h1>
          </div>
          <p className="text-muted-foreground">
            Select up to 4 pNodes to compare their configurations side-by-side.
          </p>
        </div>

        <Badge variant="outline" className="w-fit">
          {selectedIds.length}/4 selected
        </Badge>
      </div>

      {/* Node selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add pNodes to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by pubkey or IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value=""
              onValueChange={(value) => {
                if (value) addNode(value);
              }}
              disabled={selectedIds.length >= 4}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a pNode..." />
              </SelectTrigger>
              <SelectContent>
                {filteredNodes.slice(0, 20).map((node) => (
                  <SelectItem key={node.pubkey} value={node.pubkey}>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{node.derived.shortPubkey}</code>
                      <span className="text-muted-foreground text-xs">
                        {node.derived.ipAddress}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected chips */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedNodes.map((node) => (
                <Badge
                  key={node.pubkey}
                  variant="secondary"
                  className="gap-2 pr-1"
                >
                  <Server className="h-3 w-3" />
                  <code className="text-xs">{node.derived.shortPubkey}</code>
                  <button
                    onClick={() => removeNode(node.pubkey)}
                    className="p-0.5 rounded hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison table */}
      {selectedNodes.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pNodes selected</h3>
            <p className="text-muted-foreground max-w-sm">
              Use the selector above to add pNodes you want to compare. You can
              select up to 4 nodes.
            </p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-muted/30 rounded-tl-lg font-medium text-muted-foreground">
                  Property
                </th>
                {selectedNodes.map((node, i) => (
                  <th
                    key={node.pubkey}
                    className={`text-left p-4 bg-muted/30 font-medium ${
                      i === selectedNodes.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <code className="text-sm">{node.derived.shortPubkey}</code>
                      <CopyButton value={node.pubkey} label="Copy pubkey" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Pubkey */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Full Pubkey
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    <code className="text-xs break-all">{node.pubkey}</code>
                  </td>
                ))}
              </tr>

              {/* Version */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Version
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    <VersionBadge
                      version={node.version}
                      modalVersion={snapshot?.stats.modalVersion}
                    />
                  </td>
                ))}
              </tr>

              {/* Shred Version */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Shred Version
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4 font-mono">
                    {node.shredVersion ?? "—"}
                  </td>
                ))}
              </tr>

              {/* Feature Set */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Feature Set
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4 font-mono">
                    {node.featureSet ?? "—"}
                  </td>
                ))}
              </tr>

              {/* IP Address */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  IP Address
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4 font-mono">
                    {node.derived.ipAddress ?? "—"}
                  </td>
                ))}
              </tr>

              {/* Has RPC */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  RPC Endpoint
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    {node.derived.hasRpc ? (
                      <div className="flex items-center gap-2 text-chart-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Not available</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Has Pubsub */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Pubsub Endpoint
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    {node.derived.hasPubsub ? (
                      <div className="flex items-center gap-2 text-chart-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Not available</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Endpoint Count */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Total Endpoints
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    <span className="font-mono">
                      {node.derived.endpointCount}/10
                    </span>
                  </td>
                ))}
              </tr>

              {/* RPC Address */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  RPC Address
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    {node.endpoints.rpc ? (
                      <code className="text-xs">{node.endpoints.rpc}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Gossip Address */}
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-medium text-muted-foreground">
                  Gossip Address
                </td>
                {selectedNodes.map((node) => (
                  <td key={node.pubkey} className="p-4">
                    {node.endpoints.gossip ? (
                      <code className="text-xs">{node.endpoints.gossip}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

