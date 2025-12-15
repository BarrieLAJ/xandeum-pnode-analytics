/**
 * Query key factory for consistent and type-safe query keys
 */

export const queryKeys = {
  // pNodes
  pnodes: {
    all: ["pnodes"] as const,
    snapshot: (params?: { search?: string; version?: string; hasRpc?: boolean }) =>
      [...queryKeys.pnodes.all, "snapshot", params] as const,
    detail: (pubkey: string) =>
      [...queryKeys.pnodes.all, "detail", pubkey] as const,
    probe: () => [...queryKeys.pnodes.all, "probe"] as const,
  },

  // Geo
  geo: {
    all: ["geo"] as const,
    data: (limit?: number) => [...queryKeys.geo.all, "data", limit] as const,
  },
} as const;

