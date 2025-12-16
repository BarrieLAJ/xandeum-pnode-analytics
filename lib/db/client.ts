// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Strip quotes from DATABASE_URL if present (common in .env files)
function getDatabaseUrl(): string {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is not set. Database features are disabled.");
	}
	// Remove surrounding quotes if present
	return url.replace(/^["']|["']$/g, "");
}

// Lazy initialization - only create when DATABASE_URL is available
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
	if (!_db) {
		const url = getDatabaseUrl();
		const sql = neon(url);
		_db = drizzle({ client: sql });
	}

	return _db;
}
