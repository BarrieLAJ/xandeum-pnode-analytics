import {
  pgTable,
  bigserial,
  bigint,
  boolean,
  integer,
  jsonb,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Network-level aggregated snapshots (timeseries).
 */
export const networkSnapshots = pgTable("network_snapshots", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ts: timestamp("ts", { withTimezone: true }).notNull(),

  totalPods: integer("total_pods").notNull(),
  publicPods: integer("public_pods").notNull(),

  totalStorageCommittedBytes: bigint("total_storage_committed_bytes", {
    mode: "number",
  }).notNull(),
  totalStorageUsedBytes: bigint("total_storage_used_bytes", { mode: "number" }).notNull(),

  uniqueVersions: integer("unique_versions").notNull(),
  modalVersion: text("modal_version"),
  versionDistribution: jsonb("version_distribution").$type<Record<string, number>>(),
});

/**
 * Per-pod snapshots (timeseries).
 */
export const podSnapshots = pgTable("pod_snapshots", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ts: timestamp("ts", { withTimezone: true }).notNull(),

  pubkey: text("pubkey").notNull(),
  ip: text("ip"),
  address: text("address"),
  prpcPort: integer("prpc_port"),
  prpcUrl: text("prpc_url"),
  isPublic: boolean("is_public").notNull(),

  version: text("version"),
  lastSeenTimestamp: integer("last_seen_timestamp"),
  uptimeSeconds: integer("uptime_seconds"),

  storageCommittedBytes: bigint("storage_committed_bytes", { mode: "number" }),
  storageUsedBytes: bigint("storage_used_bytes", { mode: "number" }),
  storageUsagePercent: real("storage_usage_percent"),
});

/**
 * On-demand / sampled live stats from `get stats` (hybrid, not always available for every pod).
 */
export const podStatsSamples = pgTable("pod_stats_samples", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ts: timestamp("ts", { withTimezone: true }).notNull(),

  pubkey: text("pubkey").notNull(),
  prpcUrl: text("prpc_url"),

  cpuPercent: real("cpu_percent"),
  ramUsedBytes: bigint("ram_used_bytes", { mode: "number" }),
  ramTotalBytes: bigint("ram_total_bytes", { mode: "number" }),
  uptimeSeconds: integer("uptime_seconds"),
  packetsReceived: integer("packets_received"),
  packetsSent: integer("packets_sent"),
  activeStreams: integer("active_streams"),

  raw: jsonb("raw").$type<unknown>(),
});


