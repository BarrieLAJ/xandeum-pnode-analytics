/**
 * Domain types for pNodes
 * Core data structures and interfaces used throughout the application
 */

/**
 * Endpoint information for a pNode
 */
export interface PnodeEndpoints {
	gossip?: string;
	rpc?: string;
	pubsub?: string;
	tpu?: string;
	tpuForwards?: string;
	tpuForwardsQuic?: string;
	tpuQuic?: string;
	tpuVote?: string;
	tvu?: string;
	serveRepair?: string;
}

/**
 * Derived fields computed from raw data
 */
export interface PnodeDerived {
	/** Whether this node has an RPC endpoint */
	hasRpc: boolean;
	/** Whether this node has a pubsub endpoint */
	hasPubsub: boolean;
	/** Short version of pubkey for display */
	shortPubkey: string;
	/** IP address extracted from gossip endpoint */
	ipAddress?: string;
	/** Count of available endpoints */
	endpointCount: number;
	/** Staking score (0-100) - composite score for staking decisions */
	stakingScore?: number | null;
	/** Staking tier (A, B, C, D) based on score */
	stakingTier?: "A" | "B" | "C" | "D" | null;
	/** Human-readable reasons explaining the staking score */
	stakingReasons?: string[];
}

/**
 * Optional probe results for RPC health
 */
export interface PnodeProbeResult {
	/** Whether the RPC endpoint responded */
	rpcReachable: boolean;
	/** Latency in milliseconds */
	latencyMs?: number;
	/** Version reported by RPC */
	rpcVersion?: string;
	/** Error message if probe failed */
	error?: string;
	/** Timestamp of probe */
	probedAt: string;
}

/**
 * Canonical pNode row for table display
 */
export interface PnodeRow {
	/** Unique identifier (pubkey) */
	pubkey: string;
	/** Software version */
	version: string | null;
	/** Shred version for consensus */
	shredVersion: number | null;
	/** Feature set identifier */
	featureSet: number | null;
	/** Pod stats from Xandeum pNode pRPC (if available) */
	pod?: {
		address: string;
		isPublic: boolean;
		lastSeenTimestamp: number;
		prpcPort: number;
		prpcUrl?: string;
		uptimeSeconds: number;
		storageCommittedBytes: number;
		storageUsedBytes: number;
		storageUsagePercent: number;
		credits?: number | null;
	};
	/** All available endpoints */
	endpoints: PnodeEndpoints;
	/** Computed/derived fields */
	derived: PnodeDerived;
	/** Optional probe results */
	probe?: PnodeProbeResult;
	/** Raw data for inspection */
	raw: unknown;
}

/**
 * Snapshot metadata
 */
export interface SnapshotMeta {
	/** ISO timestamp when snapshot was generated */
	generatedAt: string;
	/** pRPC source info */
	source: {
		prpcUrl: string;
		method: string;
	};
	/** Whether this data is from cache and might be stale */
	stale: boolean;
	/** Any errors encountered during fetch */
	errors?: string[];
	/** Time taken to fetch in ms */
	fetchDurationMs?: number;
}

/**
 * Full snapshot response
 */
export interface SnapshotResponse extends SnapshotMeta {
	/** All pNode rows */
	rows: PnodeRow[];
	/** Summary statistics */
	stats: SnapshotStats;
}

/**
 * Summary statistics for the snapshot
 */
export interface SnapshotStats {
	/** Total number of nodes */
	totalNodes: number;
	/** Nodes with RPC endpoints */
	nodesWithRpc: number;
	/** Nodes with pubsub endpoints */
	nodesWithPubsub: number;
	/** Version distribution */
	versionDistribution: Record<string, number>;
	/** Unique versions count */
	uniqueVersions: number;
	/** Modal (most common) version */
	modalVersion: string | null;

	/** Pods that are public (from pRPC pod list) */
	publicPods?: number;
	/** Total committed storage across pods (bytes) */
	totalStorageCommittedBytes?: number;
	/** Total used storage across pods (bytes) */
	totalStorageUsedBytes?: number;
	/** Average uptime across pods (seconds) */
	avgUptimeSeconds?: number | null;
}

