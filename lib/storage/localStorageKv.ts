/**
 * localStorage implementation of KvStore
 */

import type { KvStore } from "./kv";

/**
 * localStorage-backed key-value store
 */
export class LocalStorageKv implements KvStore {
  readonly name = "localStorage";

  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      // localStorage may be disabled or blocked
      return null;
    }
  }

  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage may be full or blocked
      console.warn(`Failed to set localStorage key: ${key}`);
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }

  has(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }
}

/**
 * Default localStorage instance (singleton)
 */
let defaultStore: LocalStorageKv | null = null;

/**
 * Get the default localStorage store
 */
export function getLocalStorageKv(): LocalStorageKv {
  if (!defaultStore) {
    defaultStore = new LocalStorageKv();
  }
  return defaultStore;
}

