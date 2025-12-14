import { z } from "zod";

/**
 * Zod schema for a single node from getClusterNodes response
 *
 * Based on actual Xandeum devnet response:
 * {
 *   "pubkey": "4jukF893ntbfTWHpEn1jK7ZjPEKXpMdVgQd3HeskMzHo",
 *   "gossip": "23.83.67.172:8000",
 *   "rpc": "23.83.67.172:8899",
 *   "pubsub": "23.83.67.172:8900",
 *   "tpu": "23.83.67.172:8003",
 *   "tpuForwards": "23.83.67.172:8004",
 *   "tpuForwardsQuic": "23.83.67.172:8010",
 *   "tpuQuic": "23.83.67.172:8009",
 *   "tpuVote": "23.83.67.172:8005",
 *   "tvu": "23.83.67.172:8001",
 *   "serveRepair": "23.83.67.172:8012",
 *   "version": "2.2.0-7c3f39e8",
 *   "featureSet": 3294202862,
 *   "shredVersion": 48698
 * }
 */
export const ClusterNodeSchema = z.object({
  // Identity
  pubkey: z.string(),

  // Network endpoints (host:port format)
  gossip: z.string().optional(),
  rpc: z.string().optional(),
  pubsub: z.string().optional(),
  tpu: z.string().optional(),
  tpuForwards: z.string().optional(),
  tpuForwardsQuic: z.string().optional(),
  tpuQuic: z.string().optional(),
  tpuVote: z.string().optional(),
  tvu: z.string().optional(),
  serveRepair: z.string().optional(),

  // Software info
  version: z.string().optional(),
  featureSet: z.number().optional(),
  shredVersion: z.number().optional(),
});

export type ClusterNode = z.infer<typeof ClusterNodeSchema>;

/**
 * Schema for the full getClusterNodes response array
 */
export const GetClusterNodesResponseSchema = z.array(ClusterNodeSchema);

export type GetClusterNodesResponse = z.infer<
  typeof GetClusterNodesResponseSchema
>;

/**
 * Validate and parse getClusterNodes response
 */
export function parseClusterNodes(data: unknown): GetClusterNodesResponse {
  return GetClusterNodesResponseSchema.parse(data);
}

/**
 * Safe parse with error details
 */
export function safeParseClusterNodes(data: unknown): {
  success: boolean;
  data?: GetClusterNodesResponse;
  error?: z.ZodError;
} {
  const result = GetClusterNodesResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

