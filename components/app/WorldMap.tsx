"use client";

import { useState, useMemo } from "react";
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
import { Globe, MapPin, Loader2, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

// World map topology URL (free, no API key needed)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Marker colors
const MARKER_FILL = "#14b8a6"; // teal-500
const MARKER_PULSE = "#2dd4bf"; // teal-400
const MARKER_STROKE = "#0d9488"; // teal-600

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

export function WorldMap() {
  const [data, setData] = useState<GeoApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null);

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
            <div className="rounded-lg overflow-hidden border border-border bg-slate-900 relative">
              {/* CSS for pulse animation - using global style tag */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes world-map-pulse {
                  0% {
                    transform: scale(1);
                    opacity: 0.8;
                  }
                  100% {
                    transform: scale(2.5);
                    opacity: 0;
                  }
                }
                .world-map-pulse {
                  animation: world-map-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .world-map-pulse-delayed {
                  animation: world-map-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                  animation-delay: 1s;
                }
              `}} />

              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 120,
                }}
                style={{ width: "100%", height: "400px" }}
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
                          fill="#1e293b"
                          stroke="#334155"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { 
                              fill: "#334155", 
                              outline: "none" 
                            },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {/* Node markers with pulse animation */}
                  {groupedMarkers.map((group, idx) => {
                    const baseRadius = Math.min(4 + group.count * 1.5, 10) / zoom;
                    
                    return (
                      <Marker 
                        key={group.key} 
                        coordinates={group.coordinates}
                      >
                        {/* Outer pulse ring 1 */}
                        <circle
                          r={baseRadius}
                          fill={MARKER_PULSE}
                          opacity={0.4}
                          className="world-map-pulse"
                          style={{ 
                            transformOrigin: "center",
                            animationDelay: `${(idx % 5) * 0.4}s` 
                          }}
                        />
                        {/* Outer pulse ring 2 (offset) */}
                        <circle
                          r={baseRadius}
                          fill={MARKER_PULSE}
                          opacity={0.3}
                          className="world-map-pulse-delayed"
                          style={{ 
                            transformOrigin: "center",
                            animationDelay: `${(idx % 5) * 0.4 + 0.5}s` 
                          }}
                        />
                        {/* Main marker dot */}
                        <circle
                          r={baseRadius}
                          fill={MARKER_FILL}
                          stroke={MARKER_STROKE}
                          strokeWidth={2 / zoom}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                            if (rect) {
                              setHoveredMarker({
                                key: group.key,
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                nodes: group.nodes,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredMarker(null)}
                        />
                        {/* Node count label */}
                        {group.count > 1 && (
                          <text
                            textAnchor="middle"
                            y={baseRadius / 3}
                            style={{
                              fontSize: `${Math.max(8, 10 / zoom)}px`,
                              fill: "#ffffff",
                              fontWeight: "bold",
                              pointerEvents: "none",
                            }}
                          >
                            {group.count}
                          </text>
                        )}
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>

              {/* Custom tooltip overlay */}
              {hoveredMarker && (
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
                      {hoveredMarker.nodes[0].city || "Unknown City"}, {hoveredMarker.nodes[0].country}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hoveredMarker.nodes.length} active pNode{hoveredMarker.nodes.length > 1 ? "s" : ""}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                      {hoveredMarker.nodes.slice(0, 4).map((n) => (
                        <div key={n.pubkey} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                          <span className="text-xs font-mono text-slate-300">
                            {n.shortPubkey}
                          </span>
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
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="relative h-3 w-3">
                    <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-50" />
                    <div className="absolute inset-0 rounded-full bg-teal-500" />
                  </div>
                  <span>Active pNode</span>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {Object.keys(data.distribution.byCountry).length} countries
                </Badge>
              </div>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live • {new Date(data.generatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

