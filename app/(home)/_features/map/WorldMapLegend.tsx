"use client";

import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface WorldMapLegendProps {
  countryCount: number;
  generatedAt: string;
}

export function WorldMapLegend({ countryCount, generatedAt }: WorldMapLegendProps) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="relative h-3 w-3">
            <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-50" />
            <div className="absolute inset-0 rounded-full bg-teal-500" />
          </div>
          <span>Active pNode</span>
        </div>
        <Badge variant="outline" className="gap-1">
          <Globe className="h-3 w-3" />
          {countryCount} countries
        </Badge>
      </div>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        Live • {new Date(generatedAt).toLocaleTimeString()}
      </span>
    </div>
  );
}

