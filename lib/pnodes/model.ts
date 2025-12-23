import { ClusterNode, PodWithStats } from "./schemas";

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

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Shorten a pubkey for display (first 4 + last 4 chars)
 */
export function shortenPubkey(pubkey: string, chars = 4): string {
	if (pubkey.length <= chars * 2 + 3) return pubkey;
	return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}

/**
 * Extract IP address from host:port string
 */
export function extractIp(hostPort: string | undefined): string | undefined {
	if (!hostPort) return undefined;
	const colonIndex = hostPort.lastIndexOf(":");
	if (colonIndex === -1) return hostPort;
	return hostPort.slice(0, colonIndex);
}

/**
 * Extract port from host:port string
 */
export function extractPort(hostPort: string | undefined): number | undefined {
	if (!hostPort) return undefined;
	const colonIndex = hostPort.lastIndexOf(":");
	if (colonIndex === -1) return undefined;
	const port = parseInt(hostPort.slice(colonIndex + 1), 10);
	return isNaN(port) ? undefined : port;
}

/**
 * Count non-null endpoints
 */
function countEndpoints(endpoints: PnodeEndpoints): number {
	return Object.values(endpoints).filter(Boolean).length;
}

/**
 * Transform a raw ClusterNode into a canonical PnodeRow
 */
export function clusterNodeToPnodeRow(node: ClusterNode): PnodeRow {
	const endpoints: PnodeEndpoints = {
		gossip: node.gossip,
		rpc: node.rpc,
		pubsub: node.pubsub,
		tpu: node.tpu,
		tpuForwards: node.tpuForwards,
		tpuForwardsQuic: node.tpuForwardsQuic,
		tpuQuic: node.tpuQuic,
		tpuVote: node.tpuVote,
		tvu: node.tvu,
		serveRepair: node.serveRepair,
	};

	const derived: PnodeDerived = {
		hasRpc: Boolean(node.rpc),
		hasPubsub: Boolean(node.pubsub),
		shortPubkey: shortenPubkey(node.pubkey),
		ipAddress: extractIp(node.gossip),
		endpointCount: countEndpoints(endpoints),
	};

	return {
		pubkey: node.pubkey,
		version: node.version ?? null,
		shredVersion: node.shredVersion ?? null,
		featureSet: node.featureSet ?? null,
		endpoints,
		derived,
		raw: node,
	};
}

/**
 * Transform a `get-pods-with-stats` pod into a canonical PnodeRow.
 */
export function podWithStatsToPnodeRow(pod: PodWithStats): PnodeRow {
	const ip = extractIp(pod.address);
	const prpcHostPort = ip ? `${ip}:${pod.rpc_port}` : undefined;
	const prpcUrl = prpcHostPort ? `http://${prpcHostPort}/rpc` : undefined;

	// For now, keep endpoints compatible with existing UI:
	// - `gossip` shows the pod address (ip:gossipPort)
	// - `rpc` points to the pRPC host:port (without scheme/path)
	const endpoints: PnodeEndpoints = {
		gossip: pod.address,
		rpc: pod.is_public && prpcHostPort ? prpcHostPort : undefined,
	};

	const derived: PnodeDerived = {
		// Reuse existing meaning: "hasRpc" ~= "publicly reachable"
		hasRpc: pod.is_public,
		hasPubsub: false,
		shortPubkey: shortenPubkey(pod.pubkey),
		ipAddress: ip,
		endpointCount: Object.values(endpoints).filter(Boolean).length,
	};

	return {
		pubkey: pod.pubkey,
		version: pod.version ?? null,
		shredVersion: null,
		featureSet: null,
		pod: {
			address: pod.address,
			isPublic: pod.is_public,
			lastSeenTimestamp: pod.last_seen_timestamp,
			prpcPort: pod.rpc_port,
			prpcUrl,
			uptimeSeconds: pod.uptime,
			storageCommittedBytes: pod.storage_committed,
			storageUsedBytes: pod.storage_used,
			storageUsagePercent: pod.storage_usage_percent,
		},
		endpoints,
		derived,
		raw: pod,
	};
}

/**
 * Compute statistics from pNode rows
 */
export function computeStats(rows: PnodeRow[]): SnapshotStats {
	const versionDistribution: Record<string, number> = {};

	let nodesWithRpc = 0;
	let nodesWithPubsub = 0;

	let publicPods = 0;
	let totalStorageCommittedBytes = 0;
	let totalStorageUsedBytes = 0;
	let uptimeSum = 0;
	let uptimeCount = 0;

	for (const row of rows) {
		// Count endpoints
		if (row.derived.hasRpc) nodesWithRpc++;
		if (row.derived.hasPubsub) nodesWithPubsub++;

		// Track versions
		const version = row.version ?? "unknown";
		versionDistribution[version] = (versionDistribution[version] || 0) + 1;

		if (row.pod) {
			if (row.pod.isPublic) publicPods++;
			totalStorageCommittedBytes += row.pod.storageCommittedBytes;
			totalStorageUsedBytes += row.pod.storageUsedBytes;
			uptimeSum += row.pod.uptimeSeconds;
			uptimeCount++;
		}
	}

	// Find modal version
	let modalVersion: string | null = null;
	let maxCount = 0;
	for (const [version, count] of Object.entries(versionDistribution)) {
		if (count > maxCount) {
			maxCount = count;
			modalVersion = version;
		}
	}

	return {
		totalNodes: rows.length,
		nodesWithRpc,
		nodesWithPubsub,
		versionDistribution,
		uniqueVersions: Object.keys(versionDistribution).length,
		modalVersion,
		publicPods,
		totalStorageCommittedBytes,
		totalStorageUsedBytes,
		avgUptimeSeconds:
			uptimeCount > 0 ? Math.round(uptimeSum / uptimeCount) : null,
	};
}

/**
 * Check if a node is on the modal (most common) version
 */
export function isOnModalVersion(
	row: PnodeRow,
	modalVersion: string | null
): boolean {
	if (!modalVersion) return true;
	return row.version === modalVersion;
}
