CREATE TABLE "network_snapshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"total_pods" integer NOT NULL,
	"public_pods" integer NOT NULL,
	"total_storage_committed_bytes" bigint NOT NULL,
	"total_storage_used_bytes" bigint NOT NULL,
	"unique_versions" integer NOT NULL,
	"modal_version" text,
	"version_distribution" jsonb
);
--> statement-breakpoint
CREATE TABLE "pod_snapshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"pubkey" text NOT NULL,
	"ip" text,
	"address" text,
	"prpc_port" integer,
	"prpc_url" text,
	"is_public" boolean NOT NULL,
	"version" text,
	"last_seen_timestamp" integer,
	"uptime_seconds" integer,
	"storage_committed_bytes" bigint,
	"storage_used_bytes" bigint,
	"storage_usage_percent" real
);
--> statement-breakpoint
CREATE TABLE "pod_stats_samples" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"pubkey" text NOT NULL,
	"prpc_url" text,
	"cpu_percent" real,
	"ram_used_bytes" bigint,
	"ram_total_bytes" bigint,
	"uptime_seconds" integer,
	"packets_received" integer,
	"packets_sent" integer,
	"active_streams" integer,
	"raw" jsonb
);
