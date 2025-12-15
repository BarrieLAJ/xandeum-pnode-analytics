"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star } from "lucide-react";

interface WatchlistButtonProps {
  pubkey: string;
  isWatched: boolean;
  onToggle: (pubkey: string) => void;
  size?: "sm" | "default";
  className?: string;
}

export function WatchlistButton({
  pubkey,
  isWatched,
  onToggle,
  size = "sm",
  className,
}: WatchlistButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(pubkey);
            }}
            className={cn(
              size === "sm" ? "h-7 w-7" : "h-9 w-9",
              className
            )}
          >
            <Star
              className={cn(
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                isWatched
                  ? "fill-chart-3 text-chart-3"
                  : "text-muted-foreground hover:text-chart-3"
              )}
            />
            <span className="sr-only">
              {isWatched ? "Remove from watchlist" : "Add to watchlist"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isWatched ? "Remove from watchlist" : "Add to watchlist"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

