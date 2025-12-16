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
