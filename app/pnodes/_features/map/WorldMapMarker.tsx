"use client";

import {
	Marker,
	// @ts-expect-error - react-simple-maps lacks type declarations
} from "react-simple-maps";

const MARKER_FILL = "#14b8a6";
const MARKER_PULSE = "#2dd4bf";

interface MarkerNode {
	pubkey: string;
	shortPubkey: string;
	coordinates: [number, number];
	city: string;
	country: string;
	countryCode: string;
	isp: string;
}

interface GroupedMarker {
	key: string;
	coordinates: [number, number];
	nodes: MarkerNode[];
	count: number;
}

interface HoveredMarker {
	key: string;
	x: number;
	y: number;
	nodes: MarkerNode[];
}

interface WorldMapMarkerProps {
	group: GroupedMarker;
	index: number;
	zoom: number;
	onHover: (marker: HoveredMarker | null) => void;
}

export function WorldMapMarker({
	group,
	index,
	zoom,
	onHover,
}: WorldMapMarkerProps) {
	const baseRadius = Math.min(5 + group.count * 1.5, 12) / zoom;
	const glowRadius = baseRadius * 1.8;

	return (
		<Marker key={group.key} coordinates={group.coordinates}>
			<circle
				r={glowRadius}
				fill={MARKER_PULSE}
				className="marker-glow-ring"
				style={{ animationDelay: `${(index % 5) * 0.3}s` }}
			/>
			<circle
				r={baseRadius}
				fill={MARKER_FILL}
				stroke="#ffffff"
				strokeWidth={1.5 / zoom}
				className="marker-breathe"
				style={{
					cursor: "pointer",
					animationDelay: `${(index % 5) * 0.2}s`,
				}}
				onMouseEnter={(e) => {
					const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
					if (rect) {
						onHover({
							key: group.key,
							x: e.clientX - rect.left,
							y: e.clientY - rect.top,
							nodes: group.nodes,
						});
					}
				}}
				onMouseLeave={() => onHover(null)}
			/>
			<circle
				r={baseRadius * 0.4}
				fill="#ffffff"
				opacity={0.9}
				style={{ pointerEvents: "none" }}
			/>
			{group.count > 1 && (
				<text
					textAnchor="middle"
					y={baseRadius + 10 / zoom}
					style={{
						fontSize: `${Math.max(9, 11 / zoom)}px`,
						fill: "#ffffff",
						fontWeight: "bold",
						pointerEvents: "none",
						textShadow: "0 1px 2px rgba(0,0,0,0.8)",
					}}
				>
					{group.count}
				</text>
			)}
		</Marker>
	);
}
