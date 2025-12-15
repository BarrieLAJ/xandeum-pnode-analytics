"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GitCompare } from "lucide-react";

interface CompareHeaderProps {
  selectedCount: number;
}

export function CompareHeader({ selectedCount }: CompareHeaderProps) {
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
          {selectedCount}/4 selected
        </Badge>
      </div>
    </>
  );
}

