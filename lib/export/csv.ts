import { PnodeRow } from "@/lib/pnodes/model";

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(value: string | number | boolean | null | undefined): string {
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
    "Shred Version",
    "Feature Set",
    "Has RPC",
    "Has Pubsub",
    "Endpoint Count",
    "Gossip",
    "RPC",
    "Pubsub",
    "TPU",
    "TPU QUIC",
    "TVU",
    "RPC Reachable",
    "Latency (ms)",
    "Probe Error",
  ];

  const csvRows: string[] = [headers.join(",")];

  for (const row of rows) {
    const values = [
      row.pubkey,
      row.derived.shortPubkey,
      row.derived.ipAddress ?? "",
      row.version ?? "",
      row.shredVersion ?? "",
      row.featureSet ?? "",
      row.derived.hasRpc ? "Yes" : "No",
      row.derived.hasPubsub ? "Yes" : "No",
      row.derived.endpointCount,
      row.endpoints.gossip ?? "",
      row.endpoints.rpc ?? "",
      row.endpoints.pubsub ?? "",
      row.endpoints.tpu ?? "",
      row.endpoints.tpuQuic ?? "",
      row.endpoints.tvu ?? "",
      row.probe?.rpcReachable !== undefined
        ? row.probe.rpcReachable
          ? "Yes"
          : "No"
        : "",
      row.probe?.latencyMs ?? "",
      row.probe?.error ?? "",
    ];

    csvRows.push(values.map(escapeCSV).join(","));
  }

  return csvRows.join("\n");
}

/**
 * Trigger a CSV download in the browser
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
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
 * Generate a timestamped filename for exports
 */
export function generateExportFilename(prefix: string = "pnodes"): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "");
  return `${prefix}_${timestamp}.csv`;
}

