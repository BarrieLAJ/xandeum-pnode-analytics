"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe, MapPin, Loader2, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

// World map topology URL (free, no API key needed)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface NodeGeo {
  pubkey: string;
  shortPubkey: string;
  ip: string | null;
  geo: {
    country: string;
    countryCode: string;
    city: string;
    lat: number;
    lon: number;
    isp: string;
  } | null;
}

interface GeoApiResponse {
  generatedAt: string;
  lookupDurationMs: number;
  totalNodes: number;
  nodesLookedUp: number;
  distribution: {
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    byIsp: Record<string, number>;
    totalWithGeo: number;
    totalWithoutGeo: number;
  };
  nodes: NodeGeo[];
}

export function WorldMap() {
  const [data, setData] = useState<GeoApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const fetchGeoData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pnodes/geo?limit=100");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch geo data");
      }
      const geoData = await res.json();
      setData(geoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Extract markers from nodes with geo data
  const markers = useMemo(() => {
    if (!data) return [];

    return data.nodes
      .filter((node): node is NodeGeo & { geo: NonNullable<NodeGeo["geo"]> } => 
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
      // Round coordinates to group nearby nodes
      const key = `${marker.coordinates[0].toFixed(1)},${marker.coordinates[1].toFixed(1)}`;
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          pNode World Map
        </CardTitle>
        <div className="flex items-center gap-2">
          {data && (
            <Badge variant="secondary">
              {markers.length} located
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGeoData}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading...
              </>
            ) : data ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5" />
                Load Map
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive mb-4">Error: {error}</div>
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
          <div className="space-y-4">
            {/* Zoom controls */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.max(1, zoom - 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {zoom.toFixed(1)}x
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.min(8, zoom + 0.5))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Map */}
            <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 120,
                }}
                style={{ width: "100%", height: "auto" }}
              >
                <ZoomableGroup
                  zoom={zoom}
                  center={center}
                  onMoveEnd={({ coordinates, zoom: newZoom }) => {
                    setCenter(coordinates);
                    setZoom(newZoom);
                  }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="hsl(var(--muted))"
                          stroke="hsl(var(--border))"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { 
                              fill: "hsl(var(--muted-foreground) / 0.3)", 
                              outline: "none" 
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Node markers */}
                  {groupedMarkers.map((group) => (
                    <TooltipProvider key={group.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Marker coordinates={group.coordinates}>
                            <circle
                              r={Math.min(4 + group.count * 2, 12) / zoom}
                              fill="hsl(var(--primary))"
                              stroke="hsl(var(--background))"
                              strokeWidth={1.5 / zoom}
                              className="cursor-pointer transition-all hover:opacity-80"
                            />
                            {group.count > 1 && zoom >= 2 && (
                              <text
                                textAnchor="middle"
                                y={1}
                                style={{
                                  fontSize: `${8 / zoom}px`,
                                  fill: "hsl(var(--primary-foreground))",
                                  fontWeight: "bold",
                                }}
                              >
                                {group.count}
                              </text>
                            )}
                          </Marker>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {group.nodes[0].city}, {group.nodes[0].country}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.count} pNode{group.count > 1 ? "s" : ""}
                            </p>
                            {group.count <= 3 &&
                              group.nodes.map((n) => (
                                <p
                                  key={n.pubkey}
                                  className="text-xs font-mono"
                                >
                                  {n.shortPubkey}
                                </p>
                              ))}
                            {group.count > 3 && (
                              <p className="text-xs text-muted-foreground">
                                + {group.count - 3} more
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span>pNode location</span>
                </div>
                <span>
                  {Object.keys(data.distribution.byCountry).length} countries
                </span>
              </div>
              <span>
                Updated: {new Date(data.generatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

