#!/usr/bin/env node
/**
 * Run database migrations
 * Usage: node scripts/migrate.mjs
 * Requires DATABASE_URL environment variable
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Strip quotes from DATABASE_URL if present (common in .env files)
function getDatabaseUrl() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error("❌ DATABASE_URL environment variable is not set");
		console.error("   Please set it in your .env file or environment");
		process.exit(1);
	}
	// Remove surrounding quotes if present
	return url.replace(/^["']|["']$/g, "");
}

const DATABASE_URL = getDatabaseUrl();

async function runMigration() {
	console.log("🔄 Running database migration...");

	const sql = neon(DATABASE_URL);
	const migrationPath = join(__dirname, "..", "drizzle", "0000_init.sql");

	let migrationSQL;
	try {
		migrationSQL = readFileSync(migrationPath, "utf-8");
	} catch (error) {
		console.error(`❌ Could not read migration file: ${migrationPath}`);
		process.exit(1);
	}

	try {
		// Execute the migration SQL
		await sql(migrationSQL);
		console.log("✅ Migration completed successfully!");
		console.log("📊 Created tables:");
		console.log("   - network_snapshots");
		console.log("   - pod_snapshots");
		console.log("   - pod_stats_samples");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		if (error.message?.includes("already exists")) {
			console.log("ℹ️  Tables may already exist. This is okay.");
		} else {
			process.exit(1);
		}
	}
}

runMigration();
