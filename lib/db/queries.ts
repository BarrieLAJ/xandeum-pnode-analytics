/**
 * Compatibility barrel for database queries
 * 
 * This file re-exports from the modular queries structure.
 * New code should import directly from lib/db/queries/* modules.
 * 
 * @deprecated Import from lib/db/queries/index.ts or specific modules instead
 */
export * from "./queries/index";
