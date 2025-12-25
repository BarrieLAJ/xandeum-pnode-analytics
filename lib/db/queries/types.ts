/**
 * Shared types and utilities for history queries
 */

export type HistoryRange = "24h" | "7d" | "30d";

/**
 * Convert a history range to a Date representing the start of that range
 */
export function rangeToSince(range: HistoryRange): Date {
	const now = Date.now();
	switch (range) {
		case "24h":
			return new Date(now - 24 * 60 * 60 * 1000);
		case "7d":
			return new Date(now - 7 * 24 * 60 * 60 * 1000);
		case "30d":
			return new Date(now - 30 * 24 * 60 * 60 * 1000);
	}
}

