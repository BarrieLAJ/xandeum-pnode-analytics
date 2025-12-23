"use client";

import React, {
	useState,
	useEffect,
	ReactNode,
	useRef,
	useCallback,
} from "react";

interface AutoSizeProps {
	className?: string;
	children: (dimensions: {
		width: number;
		height: number;
		className: string;
	}) => ReactNode;
}

export function AutoSize({ className, children }: AutoSizeProps) {
	const topElem = useRef<HTMLDivElement>(null);
	const bottomElem = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | undefined>(undefined);
	const [width, setWidth] = useState<number | undefined>(undefined);
	const lastTimerRef = useRef<NodeJS.Timeout | null>(null);

	const computeDimension = useCallback(() => {
		if (!topElem.current || !bottomElem.current) {
			return;
		}

		// Calculate height based on viewport height minus sticky offset
		// The sticky container is positioned at top-16 (64px - header height)
		// So available height = viewport height - 64px
		const viewportHeight = window.innerHeight;
		const stickyOffset = 64; // top-16 = 4rem = 64px (header height)
		const computedHeight = Math.max(0, viewportHeight - stickyOffset);
		const computedWidth = window.innerWidth;

		setHeight(computedHeight);
		setWidth(computedWidth);
	}, []);

	// ResizeObserver effect
	useEffect(() => {
		if (!topElem.current || !bottomElem.current) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			if (lastTimerRef.current) {
				clearTimeout(lastTimerRef.current);
			}
			const timer = setTimeout(() => {
				computeDimension();
			}, 30);
			lastTimerRef.current = timer;
		});

		// Observe both elements
		resizeObserver.observe(topElem.current);
		resizeObserver.observe(bottomElem.current);

		// Initial calculation
		// eslint-disable-next-line react-hooks/set-state-in-effect
		computeDimension();

		return () => {
			if (lastTimerRef.current) {
				clearTimeout(lastTimerRef.current);
			}
			resizeObserver.disconnect();
		};
	}, [computeDimension]);

	// Also listen to window resize for viewport changes
	// Note: We don't listen to scroll because height should be based on viewport, not scroll position
	useEffect(() => {
		const handleResize = () => {
			if (lastTimerRef.current) {
				clearTimeout(lastTimerRef.current);
			}
			const timer = setTimeout(() => {
				computeDimension();
			}, 30);
			lastTimerRef.current = timer;
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [computeDimension]);

	return (
		<>
			{/* Top sentinel element */}
			<div ref={topElem} className="h-0" />
			{/* Bottom sentinel element - fixed to bottom right */}
			<div
				ref={bottomElem}
				className="fixed bottom-0 right-0 h-0 pointer-events-none"
			/>
			{/* Render children with dimensions when available */}
			{width !== undefined && height !== undefined
				? children({ width, height, className: className || "" })
				: null}
		</>
	);
}
