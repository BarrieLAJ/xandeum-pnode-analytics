import { z } from "zod";

/**
 * Environment variable schema with validation
 * All pRPC configuration is centralized here
 */
const envSchema = z.object({
	// Optional: Neon / Postgres connection string for historical data
	DATABASE_URL: z.string().optional(),

	// Optional: Secret for cron ingestion endpoint protection
	CRON_SECRET: z.string().optional(),

	/**
	 * Optional: Explicit pRPC URL override.
	 * If set, we will use ONLY this endpoint.
	 *
	 * For pNode pRPC this is typically: `http://<ip>:6000/rpc`
	 */
	XANDEUM_PRPC_URL: z.url().optional(),

	/**
	 * Comma-separated list of seed pNode hosts/URLs to query for `get-pods-with-stats`.
	 *
	 * Examples:
	 * - `173.212.203.145,192.190.136.36`
	 * - `173.212.203.145:6000,173.212.220.65:6000/rpc`
	 * - `http://173.212.203.145:6000/rpc,http://192.190.136.36:6000/rpc`
	 */
	XANDEUM_PRPC_SEEDS: z
		.string()
		.default(
			[
				"173.212.203.145",
				"173.212.220.65",
				"161.97.97.41",
				"192.190.136.36",
				"192.190.136.37",
				"192.190.136.38",
				"192.190.136.28",
				"192.190.136.29",
				"207.244.255.1",
			].join(",")
		),

	// Optional: Enable per-node RPC probing for health/latency
	ENABLE_RPC_PROBES: z
		.string()
		.default("false")
		.transform((val) => val === "true"),

	// Optional: Timeout for pRPC calls in milliseconds
	PRPC_TIMEOUT_MS: z.coerce.number().positive().default(15000),

	// Optional: Maximum number of seed pNodes to query (for performance)
	PRPC_MAX_SEEDS: z.coerce.number().positive().default(4),

	// Optional: Snapshot cache TTL in seconds
	SNAPSHOT_CACHE_TTL_SECONDS: z.coerce.number().positive().default(30),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment configuration
 * Throws at startup if required vars are missing or invalid
 */
function getEnv(): Env {
	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error("❌ Invalid environment variables:");
		console.error(parsed.error.flatten().fieldErrors);
		throw new Error("Invalid environment configuration");
	}

	return parsed.data;
}

// Export singleton - validated once at module load
export const env = getEnv();

const DEFAULT_PRPC_PORT = 6000;
const DEFAULT_PRPC_PATH = "/rpc";

function normalizePrpcUrl(seedOrUrl: string): string {
	const trimmed = seedOrUrl.trim();
	const withProto = trimmed.includes("://") ? trimmed : `http://${trimmed}`;

	try {
		const url = new URL(withProto);
		if (!url.port) url.port = String(DEFAULT_PRPC_PORT);
		if (url.pathname === "/" || url.pathname === "")
			url.pathname = DEFAULT_PRPC_PATH;
		return url.toString();
	} catch {
		// Fallback: best-effort compose
		return `http://${trimmed}:${DEFAULT_PRPC_PORT}${DEFAULT_PRPC_PATH}`;
	}
}

/**
 * Get all configured pRPC seed URLs.
 */
export function getPrpcSeedUrls(): string[] {
	const seeds = env.XANDEUM_PRPC_SEEDS.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return seeds.map(normalizePrpcUrl);
}

/**
 * Get the configured pRPC URL
 */
export function getPrpcUrl(): string {
	// Explicit override wins
	if (env.XANDEUM_PRPC_URL) return env.XANDEUM_PRPC_URL;

	// Otherwise use the first seed as the default
	const [first] = getPrpcSeedUrls();
	if (!first) {
		throw new Error(
			"Missing pRPC configuration: set XANDEUM_PRPC_URL or XANDEUM_PRPC_SEEDS"
		);
	}
	return first;
}

/**
 * Check if RPC probing is enabled
 */
export function isRpcProbingEnabled(): boolean {
	return env.ENABLE_RPC_PROBES;
}

/**
 * Get the pRPC timeout in milliseconds
 */
export function getPrpcTimeoutMs(): number {
	return env.PRPC_TIMEOUT_MS;
}

/**
 * Get the snapshot cache TTL in seconds
 */
export function getSnapshotCacheTtlSeconds(): number {
	return env.SNAPSHOT_CACHE_TTL_SECONDS;
}

/**
 * Get the maximum number of seed pNodes to query
 */
export function getMaxSeeds(): number {
	return env.PRPC_MAX_SEEDS;
}
