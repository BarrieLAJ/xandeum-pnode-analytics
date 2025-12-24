import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Download a blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Download text content as a file in the browser
 */
export function downloadText(
	content: string,
	filename: string,
	mimeType: string = "text/plain"
): void {
	const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
	downloadBlob(blob, filename);
}

/**
 * Format bytes as human-readable (e.g., 1234 -> "1.2 KB").
 */
export function formatBytes(
	bytes: number | null | undefined,
	decimals = 1
): string {
	if (bytes === null || bytes === undefined) return "—";
	if (!Number.isFinite(bytes)) return "—";
	if (bytes === 0) return "0 B";

	const k = 1024;
	const dm = Math.max(0, decimals);
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
	const i = Math.min(
		Math.floor(Math.log(bytes) / Math.log(k)),
		sizes.length - 1
	);
	const value = bytes / Math.pow(k, i);
	return `${parseFloat(value.toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format seconds as a compact duration (e.g., 93784 -> "1d 2h").
 */
export function formatDurationSeconds(
	seconds: number | null | undefined
): string {
	if (seconds === null || seconds === undefined) return "—";
	if (!Number.isFinite(seconds)) return "—";
	if (seconds < 0) return "—";

	const s = Math.floor(seconds);
	const days = Math.floor(s / 86400);
	const hours = Math.floor((s % 86400) / 3600);
	const minutes = Math.floor((s % 3600) / 60);

	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

/**
 * Format a date consistently for display (prevents hydration mismatches).
 * Uses a consistent format that works the same on server and client.
 */
export function formatDate(timestamp: number | Date): string {
	const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
	// Use ISO format and convert to a readable format consistently
	// Format: YYYY-MM-DD HH:MM:SS
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Truncate a version string to a maximum length, adding ellipsis if needed.
 * Shows full version in tooltip, truncated version in display.
 */
export function truncateVersion(
	version: string | null | undefined,
	maxLength: number = 12
): string {
	if (!version) return "—";
	if (version.length <= maxLength) return version;
	return `${version.slice(0, maxLength)}...`;
}

/**
 * Aggregate time-series data points based on time range.
 * - 24h: Groups by hour (or every 2-3 hours if too dense)
 * - 7d/30d: Groups by day
 * 
 * Uses average values for numeric fields, which is standard for analytics dashboards.
 */
export function aggregateTimeSeriesData<T extends Record<string, unknown>>(
	data: T[],
	range: "24h" | "7d" | "30d",
	tsKey: keyof T = "ts" as keyof T
): T[] {
	if (data.length === 0) return [];

	// Determine bucket size based on range
	let bucketMs: number;
	if (range === "24h") {
		// For 24h, use 2-hour buckets (or 1-hour if we have < 12 points)
		// This gives us 12 points max, which is readable
		bucketMs = data.length > 12 ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000;
	} else {
		// For 7d and 30d, use daily buckets
		bucketMs = 24 * 60 * 60 * 1000;
	}

	// Group data points by time bucket
	const buckets = new Map<string, T[]>();

	for (const point of data) {
		const tsValue = point[tsKey];
		if (!tsValue) continue;

		const date = tsValue instanceof Date ? tsValue : new Date(tsValue as string | number);
		if (isNaN(date.getTime())) continue;

		// Calculate bucket start time
		const bucketTime = Math.floor(date.getTime() / bucketMs) * bucketMs;
		const bucketKey = new Date(bucketTime).toISOString();

		if (!buckets.has(bucketKey)) {
			buckets.set(bucketKey, []);
		}
		buckets.get(bucketKey)!.push(point);
	}

	// Aggregate each bucket
	const aggregated: T[] = [];

	for (const [bucketKey, points] of buckets.entries()) {
		if (points.length === 0) continue;

		// Use the bucket start time as the timestamp
		const aggregatedPoint = { ...points[0] };
		aggregatedPoint[tsKey] = bucketKey as T[keyof T];

		// Calculate averages for all numeric fields (except the timestamp)
		for (const key in aggregatedPoint) {
			if (key === tsKey) continue;

			const values = points
				.map((p) => p[key])
				.filter((v) => v !== null && v !== undefined && typeof v === "number");

			if (values.length > 0) {
				const sum = (values as number[]).reduce((a, b) => a + b, 0);
				(aggregatedPoint as Record<string, unknown>)[key] = sum / values.length;
			} else {
				// If all values are null/undefined, preserve null
				const allNull = points.every((p) => p[key] === null || p[key] === undefined);
				if (allNull) {
					(aggregatedPoint as Record<string, unknown>)[key] = null;
				}
			}
		}

		aggregated.push(aggregatedPoint);
	}

	// Sort by timestamp (ascending)
	return aggregated.sort((a, b) => {
		const aTs = a[tsKey];
		const bTs = b[tsKey];
		if (!aTs || !bTs) return 0;
		const aDate = aTs instanceof Date ? aTs : new Date(aTs as string | number);
		const bDate = bTs instanceof Date ? bTs : new Date(bTs as string | number);
		return aDate.getTime() - bDate.getTime();
	});
}
