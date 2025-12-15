"use client";

import { PnodeRow } from "@/lib/pnodes/model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Server } from "lucide-react";

interface CompareNodeSelectorProps {
  search: string;
  onSearchChange: (value: string) => void;
  filteredNodes: PnodeRow[];
  selectedNodes: PnodeRow[];
  selectedIds: string[];
  onAddNode: (pubkey: string) => void;
  onRemoveNode: (pubkey: string) => void;
}

export function CompareNodeSelector({
  search,
  onSearchChange,
  filteredNodes,
  selectedNodes,
  selectedIds,
  onAddNode,
  onRemoveNode,
}: CompareNodeSelectorProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value=""
            onValueChange={(value) => {
              if (value) onAddNode(value);
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
              <Badge key={node.pubkey} variant="secondary" className="gap-2 pr-1">
                <Server className="h-3 w-3" />
                <code className="text-xs">{node.derived.shortPubkey}</code>
                <button
                  onClick={() => onRemoveNode(node.pubkey)}
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
  );
}

