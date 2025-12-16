"use client";

import { AlertTriangle } from "lucide-react";

interface PnodeDirectoryAlertsProps {
	/** Whether data is stale */
	stale?: boolean;
	/** Fetch errors */
	errors?: string[];
}

/**
 * Alert banners for stale data, errors, and probe failures
 */
export function PnodeDirectoryAlerts({
	stale,
	errors,
}: PnodeDirectoryAlertsProps) {
	const hasAlerts = stale || (errors && errors.length > 0);

	if (!hasAlerts) return null;

	return (
		<div className="space-y-4">
			{/* Stale data warning */}
			{stale && (
				<div className="flex items-center gap-3 p-4 rounded-lg bg-chart-3/10 border border-chart-3/20 text-chart-3">
					<AlertTriangle className="h-5 w-5 shrink-0" />
					<div>
						<p className="font-medium">Data may be outdated</p>
						<p className="text-sm opacity-80">
							Unable to fetch fresh data from pRPC. Showing cached results.
						</p>
					</div>
				</div>
			)}

			{/* Error display */}
			{errors && errors.length > 0 && (
				<div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
					<AlertTriangle className="h-5 w-5 shrink-0" />
					<div>
						<p className="font-medium">Error fetching data</p>
						<p className="text-sm opacity-80">{errors.join(", ")}</p>
					</div>
				</div>
			)}

		</div>
	);
}
