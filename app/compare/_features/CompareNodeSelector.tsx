"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PnodeRow } from "@/lib/pnodes/model";
import { Input } from "@/components/ui/input";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Search, Server, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CompareNodeSelectorProps {
  search: string;
  onSearchChange: (value: string) => void;
  allNodes: PnodeRow[];
  selectedIds: string[];
  onAddNode: (pubkey: string) => void;
}

const ITEMS_PER_PAGE = 50;

export function CompareNodeSelector({
  search,
  onSearchChange,
  allNodes,
  selectedIds,
  onAddNode,
}: CompareNodeSelectorProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on search and exclude selected ones
  const filteredNodes = allNodes.filter(
    (node) =>
      !selectedIds.includes(node.pubkey) &&
      (search === "" ||
        node.pubkey.toLowerCase().includes(search.toLowerCase()) ||
        node.derived.ipAddress?.toLowerCase().includes(search.toLowerCase()))
  );

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [search]);

  // Get visible nodes for pagination
  const visibleNodes = filteredNodes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredNodes.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || !scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const loadMoreElement = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            const next = Math.min(prev + ITEMS_PER_PAGE, filteredNodes.length);
            return next;
          });
        }
      },
      {
        root: scrollContainer,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    // Small delay to ensure the element is in the DOM
    const timeoutId = setTimeout(() => {
      observer.observe(loadMoreElement);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [hasMore, filteredNodes.length]);

  const handleAddNode = useCallback(
    (pubkey: string) => {
      if (selectedIds.length < 4 && !selectedIds.includes(pubkey)) {
        onAddNode(pubkey);
      }
    },
    [selectedIds, onAddNode]
  );

  const isMaxSelected = selectedIds.length >= 4;

  return (
    <DrawerContent className="max-h-[85vh] sm:max-w-md">
      <DrawerHeader>
        <DrawerTitle>Add pNodes to Compare</DrawerTitle>
        <DrawerDescription>
          Select up to 4 pNodes to compare. {selectedIds.length > 0 && `${selectedIds.length}/4 selected.`}
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col gap-4 p-4 overflow-hidden">
        {/* Search input */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by pubkey or IP..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Info message */}
        {isMaxSelected && (
          <div className="text-sm text-muted-foreground shrink-0">
            Maximum of 4 pNodes can be compared at once. Remove one to add another.
          </div>
        )}

        {/* Scrollable node list */}
        <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto"
            style={{ maxHeight: "calc(85vh - 200px)" }}
          >
            {visibleNodes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No pNodes found matching your search.</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {visibleNodes.map((node) => {
                    const isSelected = selectedIds.includes(node.pubkey);
                    const canAdd = !isSelected && !isMaxSelected;

                    return (
                      <button
                        key={node.pubkey}
                        onClick={() => canAdd && handleAddNode(node.pubkey)}
                        disabled={!canAdd}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                          "flex items-center justify-between gap-4",
                          !canAdd && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <code className="text-xs font-mono truncate">
                              {node.derived.shortPubkey}
                            </code>
                            {node.derived.ipAddress && (
                              <span className="text-xs text-muted-foreground truncate">
                                {node.derived.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                        {canAdd && (
                          <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {isSelected && (
                          <Badge variant="secondary" className="shrink-0">
                            Selected
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="flex items-center justify-center py-4"
                  >
                    <div className="text-sm text-muted-foreground">Loading more...</div>
                  </div>
                )}

                {!hasMore && visibleNodes.length > 0 && (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground border-t">
                    Showing all {filteredNodes.length} pNode{filteredNodes.length !== 1 ? "s" : ""}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DrawerContent>
  );
}

