import { PnodeRow } from "@/lib/pnodes/model";
import { downloadText } from "@/lib/utils";

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(
	value: string | number | boolean | null | undefined
): string {
	if (value === null || value === undefined) {
		return "";
	}

	const str = String(value);

	// If the value contains comma, quote, or newline, wrap in quotes and escape existing quotes
	if (str.includes(",") || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`;
	}

	return str;
}

/**
 * Convert pNode rows to CSV format
 */
export function pnodesToCSV(rows: PnodeRow[]): string {
	// Define columns
	const headers = [
		"Pubkey",
		"Short Pubkey",
		"IP Address",
		"Version",
		"Public",
		"Last Seen (unix)",
		"Uptime (s)",
		"Storage Committed (bytes)",
		"Storage Used (bytes)",
		"Storage Usage (%)",
		"Credits",
		"pRPC URL",
	];

	const csvRows: string[] = [headers.join(",")];

	for (const row of rows) {
		const values = [
			row.pubkey,
			row.derived.shortPubkey,
			row.derived.ipAddress ?? "",
			row.version ?? "",
			row.pod?.isPublic ? "Yes" : "No",
			row.pod?.lastSeenTimestamp ?? "",
			row.pod?.uptimeSeconds ?? "",
			row.pod?.storageCommittedBytes ?? "",
			row.pod?.storageUsedBytes ?? "",
			row.pod?.storageUsagePercent ?? "",
			row.pod?.credits ?? "",
			row.pod?.prpcUrl ?? "",
		];

		csvRows.push(values.map(escapeCSV).join(","));
	}

	return csvRows.join("\n");
}

/**
 * Trigger a CSV download in the browser
 */
export function downloadCSV(content: string, filename: string): void {
	downloadText(content, filename, "text/csv");
}

/**
 * Generate a timestamped filename for exports
 */
export function generateExportFilename(prefix: string = "pnodes"): string {
	const now = new Date();
	const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "");
	return `${prefix}_${timestamp}.csv`;
}
