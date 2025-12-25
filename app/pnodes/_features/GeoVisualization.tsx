"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Loader2, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NodeGeoData } from "./api";
import { useWorldMapData } from "./hooks/useWorldMap";
import { useGeoDistributionData } from "./hooks/useGeoDistribution";
import { WorldMapContent, WorldMapLegend } from "./map";

export function GeoVisualization() {
	const [activeTab, setActiveTab] = useState("map");

	const {
		data: mapData,
		isLoading: mapLoading,
		error: mapError,
		loadGeoData: loadMapData,
		hasData: mapHasData,
	} = useWorldMapData();

	const {
		data: geoData,
		isLoading: geoLoading,
		error: geoError,
		loadGeoData: loadGeoData,
		hasData: geoHasData,
	} = useGeoDistributionData();

	// Extract markers from nodes with geo data for map
	const markers = useMemo(() => {
		if (!mapData) return [];

		return mapData.nodes
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
	}, [mapData]);

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

	const handleRefresh = () => {
		if (activeTab === "map") {
			loadMapData();
		} else {
			loadGeoData();
		}
	};

	const isLoading = activeTab === "map" ? mapLoading : geoLoading;
	const hasData = activeTab === "map" ? mapHasData : geoHasData;

	return (
		<Card className="animate-fade-in">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2">
					<Globe className="h-5 w-5 text-primary" />
					Geographic Visualization
				</CardTitle>
				{hasData && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleRefresh}
						disabled={isLoading}
						className="gap-2"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Refreshing...
							</>
						) : (
							<>
								<RefreshCw className="h-3.5 w-3.5" />
								Refresh
							</>
						)}
					</Button>
				)}
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="w-full">
						<TabsTrigger value="map" className="flex-1">
							<MapPin className="h-4 w-4 mr-2" />
							World Map
						</TabsTrigger>
						<TabsTrigger value="distribution" className="flex-1">
							<Globe className="h-4 w-4 mr-2" />
							Distribution
						</TabsTrigger>
					</TabsList>

					<TabsContent value="map" className="mt-4">
						{mapError && (
							<div className="text-sm text-destructive mb-4">
								Error: {mapError.message}
							</div>
						)}

						{mapLoading && !mapData && (
							<div className="text-center py-12">
								<Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
								<p className="text-sm text-muted-foreground">
									Looking up node locations...
								</p>
								<p className="text-xs mt-2 text-muted-foreground opacity-70">
									Uses IP geolocation (may take a moment)
								</p>
							</div>
						)}

						{mapData && (
							<>
								<WorldMapContent
									groupedMarkers={groupedMarkers}
									onMarkerHover={() => {}}
								/>
								<WorldMapLegend
									countryCount={Object.keys(mapData.distribution.byCountry).length}
									generatedAt={mapData.generatedAt}
								/>
							</>
						)}
					</TabsContent>

					<TabsContent value="distribution" className="mt-4">
						{geoError && (
							<div className="text-sm text-destructive mb-4">
								Error: {geoError.message}
							</div>
						)}

						{geoLoading && !geoData && (
							<div className="text-center py-8">
								<Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
								<p className="text-sm text-muted-foreground">Looking up locations...</p>
								<p className="text-xs mt-2 text-muted-foreground opacity-70">
									Uses IP geolocation (rate-limited, may take a moment)
								</p>
							</div>
						)}

						{geoData && (
							<div className="space-y-6">
								{/* Stats */}
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary">
										{geoData.distribution.totalWithGeo} located
									</Badge>
									<Badge variant="outline">
										{Object.keys(geoData.distribution.byCountry).length} countries
									</Badge>
									<Badge variant="outline">
										{Object.keys(geoData.distribution.byCity).length} cities
									</Badge>
								</div>

								{/* Country distribution */}
								<div className="space-y-3">
									<h4 className="text-sm font-medium text-muted-foreground">
										By Country
									</h4>
									{(() => {
										const sortedCountries = Object.entries(geoData.distribution.byCountry)
											.sort(([, a], [, b]) => (b as number) - (a as number))
											.slice(0, 10);
										const maxCountryCount =
											sortedCountries.length > 0 ? (sortedCountries[0][1] as number) : 0;

										return sortedCountries.length === 0 ? (
											<p className="text-sm text-muted-foreground">No data available</p>
										) : (
											sortedCountries.map(([country, count]) => {
												const countNum = count as number;
												const percentage = (countNum / maxCountryCount) * 100;
												return (
													<div key={country} className="space-y-1">
														<div className="flex items-center justify-between text-sm">
															<span>{country}</span>
															<span className="text-muted-foreground">
																{countNum} nodes (
																{Math.round(
																	(countNum / geoData.distribution.totalWithGeo) * 100
																)}
																%)
															</span>
														</div>
														<div className="h-2 rounded-full bg-muted overflow-hidden">
															<div
																className="h-full rounded-full bg-primary transition-all duration-500"
																style={{ width: `${percentage}%` }}
															/>
														</div>
													</div>
												);
											})
										);
									})()}
								</div>

								{/* Timestamp */}
								<p className="text-xs text-muted-foreground">
									Updated: {new Date(geoData.generatedAt).toLocaleString()} (
									{geoData.lookupDurationMs}ms)
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
