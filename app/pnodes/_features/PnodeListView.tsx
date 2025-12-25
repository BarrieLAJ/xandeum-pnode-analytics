"use client";

import { PnodeRow } from "@/lib/pnodes/model";
import { PnodeTable } from "./table";
import { PnodeCardList } from "./cards/PnodeCardList";
import { cn } from "@/lib/utils";
import useMediaViewport from "@/components/ui/hooks/useMediaViewport";

interface PnodeListViewProps {
	rows: PnodeRow[];
	modalVersion: string | null;
	versions: string[];
	watchlist?: string[];
	onToggleWatchlist?: (pubkey: string) => void;
	probing?: boolean;
	onProbe?: () => void;
	showWatchlistFilter?: boolean;
	containerHeight?: number | null;
	className?: string;
}

/**
 * Wrapper component that conditionally renders table (medium screens and above) or cards (mobile only)
 * based on viewport size using CSS responsive classes
 */
export function PnodeListView({
	rows,
	modalVersion,
	versions,
	watchlist = [],
	onToggleWatchlist,
	probing = false,
	onProbe,
	showWatchlistFilter = false,
	containerHeight,
	className,
}: PnodeListViewProps) {
	const { isMobile } = useMediaViewport();
	return (
		<>
			{/* Medium screens and above: Show table (md and above) */}
			{!isMobile && (
				<div className={cn("hidden md:block h-full min-h-0 flex-col", className)}>
					<PnodeTable
						rows={rows}
						modalVersion={modalVersion}
						versions={versions}
						watchlist={watchlist}
						onToggleWatchlist={onToggleWatchlist}
						showWatchlistFilter={showWatchlistFilter}
						probing={probing}
						onProbe={onProbe}
						containerHeight={containerHeight}
					/>
				</div>
			)}

			{/* Mobile: Show cards (below md) */}
			{isMobile && (
				<div className={cn("md:hidden", className)}>
					<PnodeCardList
						rows={rows}
						modalVersion={modalVersion}
						versions={versions}
						watchlist={watchlist}
						onToggleWatchlist={onToggleWatchlist}
						showWatchlistFilter={showWatchlistFilter}
						probing={probing}
						onProbe={onProbe}
					/>
				</div>
			)}
		</>
	);
}
