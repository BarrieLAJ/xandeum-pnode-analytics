"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";
import type { NodeGeoData } from "./api";
import { useWorldMapData } from "./hooks/useWorldMap";
import { WorldMapHeader, WorldMapContent, WorldMapLegend } from "./map";

export function WorldMap() {
	const {
		data,
		isLoading: loading,
		error,
		loadGeoData,
		hasData,
	} = useWorldMapData();

	const fetchGeoData = () => {
		loadGeoData();
	};

	// Extract markers from nodes with geo data
	const markers = useMemo(() => {
		if (!data) return [];

		return data.nodes
			.filter(
				(node): node is NodeGeoData & { geo: NonNullable<NodeGeoData["geo"]> } =>
					node.geo !== null
			)
			.map((node) => ({
				pubkey: node.pubkey,
				shortPubkey: node.shortPubkey,
				coordinates: [node.geo.lon, node.geo.lat] as [number, number],
				city: node.geo.city,
				country: node.geo.country,
				countryCode: node.geo.countryCode,
				isp: node.geo.isp,
			}));
	}, [data]);

	// Group markers by location for clustering
	const groupedMarkers = useMemo(() => {
		const groups = new Map<string, typeof markers>();

		markers.forEach((marker) => {
			const key = `${marker.coordinates[0].toFixed(
				1
			)},${marker.coordinates[1].toFixed(1)}`;
			const existing = groups.get(key) || [];
			groups.set(key, [...existing, marker]);
		});

		return Array.from(groups.entries()).map(([key, nodes]) => ({
			key,
			coordinates: nodes[0].coordinates,
			nodes,
			count: nodes.length,
		}));
	}, [markers]);

	return (
		<Card className="animate-fade-in">
			<WorldMapHeader
				markerCount={markers.length}
				loading={loading}
				hasData={hasData}
				onLoad={fetchGeoData}
			/>
			<CardContent>
				{error && (
					<div className="text-sm text-destructive mb-4">Error: {error.message}</div>
				)}

				{!data && !loading && !error && (
					<div className="text-center py-12 text-muted-foreground">
						<Globe className="h-16 w-16 mx-auto mb-4 opacity-30" />
						<p className="text-sm">
							Click &quot;Load Map&quot; to see pNode locations worldwide
						</p>
						<p className="text-xs mt-2 opacity-70">
							Uses IP geolocation (may take a moment)
						</p>
					</div>
				)}

				{loading && !data && (
					<div className="text-center py-12">
						<Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">
							Looking up node locations...
						</p>
					</div>
				)}

				{data && (
					<>
						<WorldMapContent
							groupedMarkers={groupedMarkers}
							onMarkerHover={() => {}}
						/>
						<WorldMapLegend
							countryCount={Object.keys(data.distribution.byCountry).length}
							generatedAt={data.generatedAt}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
}
