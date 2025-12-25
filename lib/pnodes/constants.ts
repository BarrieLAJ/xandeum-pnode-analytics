/**
 * Centralized constants for pNodes domain
 * All magic numbers, strings, and configuration values should be defined here
 */

/**
 * Cache keys for pNodes data
 */
export const CACHE_KEYS = {
	/** Cache key for the full snapshot of all pNodes */
	SNAPSHOT: "pnodes:snapshot",
	/** Prefix for individual node cache keys */
	NODE_PREFIX: "pnode:",
	/** Prefix for node stats cache keys */
	STATS_PREFIX: "pnode:stats:",
} as const;

/**
 * Cache TTL values in milliseconds
 */
export const CACHE_TTL = {
	/** Snapshot cache TTL (30 seconds) */
	SNAPSHOT_MS: 30_000,
	/** Node detail cache TTL (60 seconds) */
	NODE_DETAIL_MS: 60_000,
	/** Per-node stats cache TTL (15 seconds) */
	STATS_MS: 15_000,
} as const;

/**
 * Stats collection configuration
 */
export const STATS_CONFIG = {
	/** Timeout for stats collection RPC calls (7 seconds) */
	TIMEOUT_MS: 7000,
	/** Concurrency limit for stats collection */
	CONCURRENCY: 20,
	/** Maximum number of nodes to collect stats from (null = all) */
	MAX_NODES_TO_COLLECT: null as number | null,
} as const;

/**
 * Probe configuration
 */
export const PROBE_CONFIG = {
	/** Timeout for probe RPC calls (5 seconds) */
	TIMEOUT_MS: 5000,
	/** Concurrency limit for probing */
	CONCURRENCY: 10,
} as const;

