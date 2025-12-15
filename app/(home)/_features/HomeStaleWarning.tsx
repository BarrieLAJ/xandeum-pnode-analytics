import { AlertTriangle } from "lucide-react";

interface HomeStaleWarningProps {
  stale: boolean;
}

export function HomeStaleWarning({ stale }: HomeStaleWarningProps) {
  if (!stale) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/20 text-chart-3">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">Data may be outdated</p>
        <p className="text-sm opacity-80">
          Unable to fetch fresh data. Showing cached results.
        </p>
      </div>
    </div>
  );
}

