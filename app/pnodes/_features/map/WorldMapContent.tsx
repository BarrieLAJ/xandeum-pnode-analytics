"use client";

import { useState } from "react";
import {
	ComposableMap,
	ZoomableGroup,
	// @ts-expect-error - react-simple-maps lacks type declarations
} from "react-simple-maps";
import { WorldMapTooltip } from "./WorldMapTooltip";
import { WorldMapZoomControls } from "./WorldMapZoomControls";
import { WorldMapMarker } from "./WorldMapMarker";
import { WorldMapStyles } from "./WorldMapStyles";
import { WorldMapGeographies } from "./WorldMapGeographies";

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

interface WorldMapContentProps {
	groupedMarkers: GroupedMarker[];
	onMarkerHover: (marker: HoveredMarker | null) => void;
}

export function WorldMapContent({
	groupedMarkers,
	onMarkerHover,
}: WorldMapContentProps) {
	const [zoom, setZoom] = useState(1);
	const [center, setCenter] = useState<[number, number]>([0, 20]);
	const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null);

	const handleMarkerHover = (marker: HoveredMarker | null) => {
		setHoveredMarker(marker);
		onMarkerHover(marker);
	};

	return (
		<div className="space-y-4">
			<WorldMapZoomControls
				zoom={zoom}
				onZoomIn={() => setZoom(Math.min(8, zoom + 0.5))}
				onZoomOut={() => setZoom(Math.max(1, zoom - 0.5))}
			/>

			<div className="rounded-lg overflow-hidden border border-border bg-slate-900 relative">
				<WorldMapStyles />

				<ComposableMap
					projection="geoMercator"
					projectionConfig={{ scale: 120 }}
					style={{ width: "100%", height: "400px" }}
				>
					<ZoomableGroup
						zoom={zoom}
						center={center}
						onMoveEnd={({
							coordinates,
							zoom: newZoom,
						}: {
							coordinates: [number, number];
							zoom: number;
						}) => {
							setCenter(coordinates);
							setZoom(newZoom);
						}}
					>
						<WorldMapGeographies />

						{groupedMarkers.map((group, idx) => (
							<WorldMapMarker
								key={group.key}
								group={group}
								index={idx}
								zoom={zoom}
								onHover={handleMarkerHover}
							/>
						))}
					</ZoomableGroup>
				</ComposableMap>

				<WorldMapTooltip hoveredMarker={hoveredMarker} />
			</div>
		</div>
	);
}
