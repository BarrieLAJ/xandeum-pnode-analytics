"use client";

import { useState, useCallback, useEffect } from "react";
import {
	getWatchlist,
	addToWatchlist,
	removeFromWatchlist,
	clearWatchlist,
} from "@/lib/watchlist/storage";

/**
 * React hook for managing the pNode watchlist
 * SSR-safe: initializes with empty array, syncs with localStorage after hydration
 */
export function useWatchlist() {
	// Always start with empty array to match server render
	const [watchlist, setWatchlist] = useState<string[]>([]);

	// Sync with localStorage after component mounts (after hydration)
	// This is necessary to avoid hydration mismatches while still reading from localStorage
	// Note: setState in useEffect is intentional here to sync external state (localStorage) after hydration
	useEffect(() => {
		try {
			const stored = getWatchlist();
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setWatchlist(stored);
		} catch {
			setWatchlist([]);
		}
	}, []);

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
