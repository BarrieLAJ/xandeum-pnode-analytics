import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from "lucide-react";

export type StatusType = "online" | "warning" | "offline" | "unknown";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  tooltip?: string;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    icon: typeof CheckCircle;
    label: string;
    className: string;
  }
> = {
  online: {
    icon: CheckCircle,
    label: "Online",
    className:
      "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20",
  },
  warning: {
    icon: AlertCircle,
    label: "Warning",
    className:
      "bg-chart-3/10 text-chart-3 border-chart-3/20 hover:bg-chart-3/20",
  },
  offline: {
    icon: XCircle,
    label: "Offline",
    className:
      "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
  unknown: {
    icon: HelpCircle,
    label: "Unknown",
    className:
      "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
};

export function StatusBadge({
  status,
  label,
  tooltip,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label ?? config.label;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium transition-colors",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {displayLabel}
    </Badge>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

interface VersionBadgeProps {
  version: string | null;
  modalVersion?: string | null;
  className?: string;
}

export function VersionBadge({
  version,
  modalVersion,
  className,
}: VersionBadgeProps) {
  if (!version) {
    return (
      <Badge
        variant="outline"
        className={cn("text-muted-foreground", className)}
      >
        Unknown
      </Badge>
    );
  }

  const isModal = modalVersion && version === modalVersion;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs",
              isModal
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-chart-3/10 text-chart-3 border-chart-3/20",
              className
            )}
          >
            {version}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isModal
              ? "Running the most common version"
              : `Different from modal version (${modalVersion ?? "unknown"})`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

