/**
 * Staking score calculation for pNodes
 * 
 * Provides a transparent, explainable heuristic for evaluating node quality
 * for staking decisions. This is NOT official staking advice.
 * 
 * Scoring factors:
 * - Reliability (public reachability)
 * - Performance (latency, health)
 * - Uptime
 * - Capacity (storage)
 * - Credits
 */

import type { PnodeRow } from "./types";

/**
 * Context for normalizing scores across all nodes
 */
export interface StakingScoreContext {
	/** Percentile values for normalization */
	percentiles: {
		credits: { p25: number; p50: number; p75: number; p95: number };
		uptime: { p25: number; p50: number; p75: number; p95: number };
		storageCommitted: { p25: number; p50: number; p75: number; p95: number };
		latency: { p25: number; p50: number; p75: number; p95: number };
	};
	/** Min/max values for normalization */
	ranges: {
		credits: { min: number; max: number };
		uptime: { min: number; max: number };
		storageCommitted: { min: number; max: number };
		latency: { min: number; max: number };
	};
}

/**
 * Staking score result
 */
export interface StakingScoreResult {
	stakingScore: number;
	stakingTier: "A" | "B" | "C" | "D";
	stakingReasons: string[];
}

/**
 * Calculate percentiles for a sorted array
 */
function percentile(sorted: number[], p: number): number {
	if (sorted.length === 0) return 0;
	const index = Math.floor((p / 100) * (sorted.length - 1));
	return sorted[index] ?? 0;
}

/**
 * Compute normalization context from all nodes
 */
export function computeStakingScoreContext(rows: PnodeRow[]): StakingScoreContext {
	// Extract all values for normalization
	const credits: number[] = [];
	const uptimes: number[] = [];
	const storageCommitted: number[] = [];
	const latencies: number[] = [];

	for (const row of rows) {
		if (row.pod?.credits !== undefined && row.pod.credits !== null) {
			credits.push(row.pod.credits);
		}
		if (row.pod?.uptimeSeconds !== undefined) {
			uptimes.push(row.pod.uptimeSeconds);
		}
		if (row.pod?.storageCommittedBytes !== undefined) {
			storageCommitted.push(row.pod.storageCommittedBytes);
		}
		if (row.probe?.latencyMs !== undefined) {
			latencies.push(row.probe.latencyMs);
		}
	}

	// Sort for percentile calculation
	const sortedCredits = [...credits].sort((a, b) => a - b);
	const sortedUptimes = [...uptimes].sort((a, b) => a - b);
	const sortedStorage = [...storageCommitted].sort((a, b) => a - b);
	const sortedLatencies = [...latencies].sort((a, b) => a - b);

	return {
		percentiles: {
			credits: {
				p25: percentile(sortedCredits, 25),
				p50: percentile(sortedCredits, 50),
				p75: percentile(sortedCredits, 75),
				p95: percentile(sortedCredits, 95),
			},
			uptime: {
				p25: percentile(sortedUptimes, 25),
				p50: percentile(sortedUptimes, 50),
				p75: percentile(sortedUptimes, 75),
				p95: percentile(sortedUptimes, 95),
			},
			storageCommitted: {
				p25: percentile(sortedStorage, 25),
				p50: percentile(sortedStorage, 50),
				p75: percentile(sortedStorage, 75),
				p95: percentile(sortedStorage, 95),
			},
			latency: {
				p25: percentile(sortedLatencies, 25),
				p50: percentile(sortedLatencies, 50),
				p75: percentile(sortedLatencies, 75),
				p95: percentile(sortedLatencies, 95),
			},
		},
		ranges: {
			credits: {
				min: sortedCredits[0] ?? 0,
				max: sortedCredits[sortedCredits.length - 1] ?? 0,
			},
			uptime: {
				min: sortedUptimes[0] ?? 0,
				max: sortedUptimes[sortedUptimes.length - 1] ?? 0,
			},
			storageCommitted: {
				min: sortedStorage[0] ?? 0,
				max: sortedStorage[sortedStorage.length - 1] ?? 0,
			},
			latency: {
				min: sortedLatencies[0] ?? 0,
				max: sortedLatencies[sortedLatencies.length - 1] ?? 0,
			},
		},
	};
}

/**
 * Normalize a value to 0-100 score using percentiles
 */
function normalizePercentile(
	value: number,
	p25: number,
	p50: number,
	p75: number,
	p95: number
): number {
	if (value <= p25) return 25;
	if (value <= p50) return 50;
	if (value <= p75) return 75;
	if (value <= p95) return 90;
	return 100;
}

/**
 * Normalize latency (lower is better, so invert)
 */
function normalizeLatency(latency: number, ctx: StakingScoreContext): number {
	const { p25, p50, p75, p95 } = ctx.percentiles.latency;
	// Invert: lower latency = higher score
	if (latency >= p95) return 25;
	if (latency >= p75) return 50;
	if (latency >= p50) return 75;
	if (latency >= p25) return 90;
	return 100;
}

/**
 * Calculate staking score for a single node
 */
export function scorePnode(
	row: PnodeRow,
	ctx: StakingScoreContext
): StakingScoreResult {
	const reasons: string[] = [];
	let totalScore = 0;
	let factorCount = 0;

	// Factor 1: Reliability (public reachability) - 30 points
	const isPublic = row.pod?.isPublic ?? row.derived.hasRpc;
	if (isPublic) {
		totalScore += 30;
		factorCount++;
		reasons.push("Publicly reachable");
	} else {
		reasons.push("Not publicly reachable");
	}

	// Factor 2: Performance (probe reachability + latency) - 25 points
	if (row.probe) {
		if (row.probe.rpcReachable) {
			factorCount++;
			if (row.probe.latencyMs !== undefined) {
				const latencyScore = normalizeLatency(row.probe.latencyMs, ctx);
				totalScore += (latencyScore / 100) * 25;
				if (latencyScore >= 75) {
					reasons.push("Low latency");
				} else if (latencyScore >= 50) {
					reasons.push("Moderate latency");
				} else {
					reasons.push("High latency");
				}
			} else {
				// Reachable but no latency data
				totalScore += 20;
				reasons.push("RPC reachable");
			}
		} else {
			reasons.push("RPC unreachable");
		}
	} else {
		// No probe data - neutral (don't penalize, but don't reward)
		reasons.push("No probe data");
	}

	// Factor 3: Uptime - 20 points
	if (row.pod?.uptimeSeconds !== undefined) {
		const uptime = row.pod.uptimeSeconds;
		const uptimeScore = normalizePercentile(
			uptime,
			ctx.percentiles.uptime.p25,
			ctx.percentiles.uptime.p50,
			ctx.percentiles.uptime.p75,
			ctx.percentiles.uptime.p95
		);
		totalScore += (uptimeScore / 100) * 20;
		factorCount++;
		if (uptimeScore >= 75) {
			reasons.push("High uptime");
		} else if (uptimeScore >= 50) {
			reasons.push("Moderate uptime");
		} else {
			reasons.push("Low uptime");
		}
	} else {
		reasons.push("Uptime unknown");
	}

	// Factor 4: Credits - 15 points
	if (row.pod?.credits !== undefined && row.pod.credits !== null) {
		const credits = row.pod.credits;
		const creditsScore = normalizePercentile(
			credits,
			ctx.percentiles.credits.p25,
			ctx.percentiles.credits.p50,
			ctx.percentiles.credits.p75,
			ctx.percentiles.credits.p95
		);
		totalScore += (creditsScore / 100) * 15;
		factorCount++;
		if (creditsScore >= 75) {
			reasons.push("High credits");
		} else if (creditsScore >= 50) {
			reasons.push("Moderate credits");
		} else {
			reasons.push("Low credits");
		}
	} else {
		reasons.push("Credits unknown");
	}

	// Factor 5: Storage capacity - 10 points
	if (row.pod?.storageCommittedBytes !== undefined) {
		const storage = row.pod.storageCommittedBytes;
		const storageScore = normalizePercentile(
			storage,
			ctx.percentiles.storageCommitted.p25,
			ctx.percentiles.storageCommitted.p50,
			ctx.percentiles.storageCommitted.p75,
			ctx.percentiles.storageCommitted.p95
		);
		totalScore += (storageScore / 100) * 10;
		factorCount++;
		if (storageScore >= 75) {
			reasons.push("High storage capacity");
		} else if (storageScore >= 50) {
			reasons.push("Moderate storage capacity");
		} else {
			reasons.push("Low storage capacity");
		}
	} else {
		reasons.push("Storage capacity unknown");
	}

	// Normalize to 0-100 (in case we have fewer factors)
	const finalScore = factorCount > 0 ? Math.round(totalScore) : 0;

	// Determine tier
	let tier: "A" | "B" | "C" | "D";
	if (finalScore >= 80) {
		tier = "A";
	} else if (finalScore >= 60) {
		tier = "B";
	} else if (finalScore >= 40) {
		tier = "C";
	} else {
		tier = "D";
	}

	return {
		stakingScore: finalScore,
		stakingTier: tier,
		stakingReasons: reasons,
	};
}

/**
 * Apply staking scores to all nodes
 */
export function applyStakingScores(rows: PnodeRow[]): PnodeRow[] {
	if (rows.length === 0) return rows;

	// Compute context for normalization
	const ctx = computeStakingScoreContext(rows);

	// Score each node
	return rows.map((row) => {
		const scoreResult = scorePnode(row, ctx);
		return {
			...row,
			derived: {
				...row.derived,
				stakingScore: scoreResult.stakingScore,
				stakingTier: scoreResult.stakingTier,
				stakingReasons: scoreResult.stakingReasons,
			},
		};
	});
}

