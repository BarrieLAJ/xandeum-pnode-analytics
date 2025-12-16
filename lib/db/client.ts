import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/config/env";

/**
 * Drizzle + Neon client.
 *
 * NOTE: `DATABASE_URL` is optional until historical charts are enabled.
 * Any code path that uses the DB must assert it's present.
 */
export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (required for historical data)");
  }

  const sql = neon(env.DATABASE_URL);
  return drizzle(sql);
}


