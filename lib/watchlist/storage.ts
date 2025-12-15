"use client";

import { getLocalStorageKv, createTypedStore } from "@/lib/storage";

const WATCHLIST_KEY = "xandeum-pnode-watchlist";
const MAX_WATCHLIST_SIZE = 50;

/**
 * Get the typed watchlist store
 */
function getWatchlistStore() {
  const store = getLocalStorageKv();
  return createTypedStore<string[]>(store, WATCHLIST_KEY);
}

/**
 * Get the current watchlist from storage
 */
export function getWatchlist(): string[] {
  const store = getWatchlistStore();
  const data = store.get();
  
  if (!data || !Array.isArray(data)) return [];
  
  return data.filter((item): item is string => typeof item === "string");
}

/**
 * Save the watchlist to storage
 */
export function saveWatchlist(pubkeys: string[]): void {
  const store = getWatchlistStore();
  // Limit the size
  const limited = pubkeys.slice(0, MAX_WATCHLIST_SIZE);
  store.set(limited);
}

/**
 * Add a pubkey to the watchlist
 */
export function addToWatchlist(pubkey: string): string[] {
  const current = getWatchlist();

  // Don't add duplicates
  if (current.includes(pubkey)) return current;

  const updated = [pubkey, ...current].slice(0, MAX_WATCHLIST_SIZE);
  saveWatchlist(updated);

  return updated;
}

/**
 * Remove a pubkey from the watchlist
 */
export function removeFromWatchlist(pubkey: string): string[] {
  const current = getWatchlist();
  const updated = current.filter((p) => p !== pubkey);
  saveWatchlist(updated);

  return updated;
}

/**
 * Check if a pubkey is in the watchlist
 */
export function isInWatchlist(pubkey: string): boolean {
  return getWatchlist().includes(pubkey);
}

/**
 * Toggle a pubkey in the watchlist
 */
export function toggleWatchlist(pubkey: string): {
  watchlist: string[];
  added: boolean;
} {
  const current = getWatchlist();

  if (current.includes(pubkey)) {
    return {
      watchlist: removeFromWatchlist(pubkey),
      added: false,
    };
  }

  return {
    watchlist: addToWatchlist(pubkey),
    added: true,
  };
}

/**
 * Clear the entire watchlist
 */
export function clearWatchlist(): void {
  const store = getWatchlistStore();
  store.remove();
}

