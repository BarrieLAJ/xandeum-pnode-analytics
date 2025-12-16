import { defineConfig } from "drizzle-kit";

// Strip quotes from DATABASE_URL if present (common in .env files)
function getDatabaseUrl(): string {
	const url = process.env.DATABASE_URL ?? "";
	// Remove surrounding quotes if present
	return url.replace(/^["']|["']$/g, "");
}

export default defineConfig({
	schema: "./lib/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: getDatabaseUrl(),
	},
});
