"use client";

const WATCHLIST_KEY = "xandeum-pnode-watchlist";
const MAX_WATCHLIST_SIZE = 50;

/**
 * Get the current watchlist from localStorage
 */
export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/**
 * Save the watchlist to localStorage
 */
export function saveWatchlist(pubkeys: string[]): void {
  if (typeof window === "undefined") return;

  try {
    // Limit the size
    const limited = pubkeys.slice(0, MAX_WATCHLIST_SIZE);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(limited));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
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
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(WATCHLIST_KEY);
  } catch {
    // Ignore errors
  }
}

