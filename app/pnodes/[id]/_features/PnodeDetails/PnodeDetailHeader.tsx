"use client";

import Link from "next/link";
import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { VersionBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Server, Globe, Hash, Code } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PnodeDetailHeaderProps {
  node: PnodeRow;
  snapshot: SnapshotResponse;
}

export function PnodeDetailHeader({ node, snapshot }: PnodeDetailHeaderProps) {
  return (
    <>
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

        {/* Quick stats and actions */}
        <div className="flex flex-col gap-3">
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
              {node.pod?.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Code className="h-4 w-4" />
                View Raw JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Raw JSON Data</DialogTitle>
              </DialogHeader>
              <Separator className="flex-shrink-0" />
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <div className="absolute top-2 right-2 z-10">
                  <CopyButton
                    value={JSON.stringify(node.raw, null, 2)}
                    label="Copy JSON"
                    variant="outline"
                    size="sm"
                  />
                </div>
                <pre className="p-4 overflow-auto text-sm font-mono bg-muted/30 rounded-lg h-full w-full">
                  {JSON.stringify(node.raw, null, 2)}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

