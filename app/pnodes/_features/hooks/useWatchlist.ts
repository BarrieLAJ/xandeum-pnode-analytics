"use client";

import { useState, useCallback } from "react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
} from "@/lib/watchlist/storage";

/**
 * React hook for managing the pNode watchlist
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => getWatchlist());

  const isWatched = useCallback(
    (pubkey: string) => watchlist.includes(pubkey),
    [watchlist]
  );

  const add = useCallback((pubkey: string) => {
    const updated = addToWatchlist(pubkey);
    setWatchlist(updated);
  }, []);

  const remove = useCallback((pubkey: string) => {
    const updated = removeFromWatchlist(pubkey);
    setWatchlist(updated);
  }, []);

  const toggle = useCallback(
    (pubkey: string) => {
      if (isWatched(pubkey)) {
        remove(pubkey);
        return false;
      } else {
        add(pubkey);
        return true;
      }
    },
    [isWatched, add, remove]
  );

  const clear = useCallback(() => {
    clearWatchlist();
    setWatchlist([]);
  }, []);

  return {
    watchlist,
    isWatched,
    add,
    remove,
    toggle,
    clear,
    count: watchlist.length,
  };
}

