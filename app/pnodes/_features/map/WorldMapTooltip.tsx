"use client";

interface HoveredMarker {
	key: string;
	x: number;
	y: number;
	nodes: {
		pubkey: string;
		shortPubkey: string;
		city: string;
		country: string;
		countryCode: string;
		isp: string;
		coordinates: [number, number];
	}[];
}

interface WorldMapTooltipProps {
	hoveredMarker: HoveredMarker | null;
}

export function WorldMapTooltip({ hoveredMarker }: WorldMapTooltipProps) {
	if (!hoveredMarker) return null;

	return (
		<div
			className="absolute z-50 pointer-events-none"
			style={{
				left: Math.min(hoveredMarker.x + 10, 300),
				top: hoveredMarker.y - 10,
			}}
		>
			<div className="bg-slate-800 border border-teal-500/50 rounded-lg p-3 shadow-xl text-white min-w-[180px]">
				<div className="flex items-center gap-2 mb-2">
					<span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
					<span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">
						Live
					</span>
				</div>
				<p className="font-semibold text-sm">
					{hoveredMarker.nodes[0].city || "Unknown City"},{" "}
					{hoveredMarker.nodes[0].country}
				</p>
				<p className="text-xs text-slate-400 mt-1">
					{hoveredMarker.nodes.length} active pNode
					{hoveredMarker.nodes.length > 1 ? "s" : ""}
				</p>
				<div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
					{hoveredMarker.nodes.slice(0, 4).map((n) => (
						<div key={n.pubkey} className="flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
							<span className="text-xs font-mono text-slate-300">{n.shortPubkey}</span>
						</div>
					))}
					{hoveredMarker.nodes.length > 4 && (
						<p className="text-xs text-slate-500">
							+{hoveredMarker.nodes.length - 4} more nodes
						</p>
					)}
				</div>
				{hoveredMarker.nodes[0].isp && (
					<p className="text-xs text-slate-500 mt-2">
						ISP: {hoveredMarker.nodes[0].isp}
					</p>
				)}
			</div>
		</div>
	);
}
