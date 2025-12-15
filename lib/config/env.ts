import { z } from "zod";

/**
 * Environment variable schema with validation
 * All pRPC configuration is centralized here
 */
const envSchema = z.object({
	// Required: The Xandeum pRPC endpoint URL
	XANDEUM_PRPC_URL: z.url().default("https://api.devnet.xandeum.com:8899/"),

	// Optional: Enable per-node RPC probing for health/latency
	ENABLE_RPC_PROBES: z
		.string()
		.default("false")
		.transform((val) => val === "true"),

	// Optional: Timeout for pRPC calls in milliseconds
	PRPC_TIMEOUT_MS: z.coerce.number().positive().default(10000),

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

/**
 * Get the configured pRPC URL
 */
export function getPrpcUrl(): string {
	return env.XANDEUM_PRPC_URL;
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
