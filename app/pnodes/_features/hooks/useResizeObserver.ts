"use client";

import { useEffect, useRef, useState } from "react";

interface UseResizeObserverOptions {
	/**
	 * Whether the observer is enabled
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Callback fired when the size changes
	 */
	onResize?: (size: { width: number; height: number }) => void;
}

/**
 * Hook that uses ResizeObserver to track element dimensions
 * Returns the element ref and current dimensions
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
	options: UseResizeObserverOptions = {}
) {
	const { enabled = true, onResize } = options;
	const ref = useRef<T>(null);
	const [size, setSize] = useState<{ width: number; height: number } | null>(
		null
	);

	useEffect(() => {
		if (!enabled || !ref.current) {
			return;
		}

		const element = ref.current;

		// Initialize with current size
		const updateSize = () => {
			if (element) {
				const { width, height } = element.getBoundingClientRect();
				const newSize = { width, height };
				setSize(newSize);
				onResize?.(newSize);
			}
		};

		// Set initial size after a brief delay to ensure layout is complete
		const timeoutId = setTimeout(updateSize, 0);

		// Create ResizeObserver
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				const newSize = { width, height };
				setSize(newSize);
				onResize?.(newSize);
			}
		});

		resizeObserver.observe(element);

		return () => {
			clearTimeout(timeoutId);
			resizeObserver.disconnect();
		};
	}, [enabled, onResize]);

	return { ref, size };
}

/**
 * Hook that calculates available viewport height for a sticky element
 * Uses ResizeObserver to track the container's actual size and viewport changes
 */
export function useStickyContainerHeight(options: {
	/**
	 * The sticky top offset in pixels
	 * @default 128 (8rem)
	 */
	stickyTop?: number;
	/**
	 * Whether the observer is enabled
	 * @default true
	 */
	enabled?: boolean;
}) {
	const { stickyTop = 128, enabled = true } = options;
	const [height, setHeight] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const calculateHeight = () => {
			// Calculate available height based on viewport
			// This accounts for the sticky top offset
			const availableHeight = window.innerHeight - stickyTop;
			setHeight(availableHeight);
		};

		// Calculate initial height
		calculateHeight();

		// Observe window resize
		window.addEventListener("resize", calculateHeight);
		// Also observe scroll to handle dynamic content above
		window.addEventListener("scroll", calculateHeight, { passive: true });

		// Use ResizeObserver on the container to track its actual size
		// This helps when the container's size changes due to layout shifts
		let resizeObserver: ResizeObserver | null = null;
		if (containerRef.current && typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(() => {
				calculateHeight();
			});
			resizeObserver.observe(containerRef.current);
		}

		return () => {
			window.removeEventListener("resize", calculateHeight);
			window.removeEventListener("scroll", calculateHeight);
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [enabled, stickyTop]);

	return { ref: containerRef, height };
}

