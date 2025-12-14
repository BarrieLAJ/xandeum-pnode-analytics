"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Loader2, RefreshCw } from "lucide-react";

interface GeoDistributionData {
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
}

export function GeoDistribution() {
  const [data, setData] = useState<GeoDistributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeoData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pnodes/geo?limit=50");
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

  // Don't auto-fetch - let user trigger it to avoid rate limits
  const sortedCountries = data
    ? Object.entries(data.distribution.byCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  const maxCountryCount = sortedCountries.length > 0 ? sortedCountries[0][1] : 0;

  return (
    <Card className="animate-fade-in stagger-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Geographic Distribution
        </CardTitle>
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
              Load Geo Data
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive mb-4">
            Error: {error}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Click &quot;Load Geo Data&quot; to see geographic distribution
            </p>
            <p className="text-xs mt-2 opacity-70">
              Uses IP geolocation (rate-limited)
            </p>
          </div>
        )}

        {loading && !data && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Looking up locations...
            </p>
            <p className="text-xs mt-2 text-muted-foreground opacity-70">
              This may take a moment
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {data.distribution.totalWithGeo} located
              </Badge>
              <Badge variant="outline">
                {Object.keys(data.distribution.byCountry).length} countries
              </Badge>
              <Badge variant="outline">
                {Object.keys(data.distribution.byCity).length} cities
              </Badge>
            </div>

            {/* Country distribution */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                By Country
              </h4>
              {sortedCountries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available</p>
              ) : (
                sortedCountries.map(([country, count]) => {
                  const percentage = (count / maxCountryCount) * 100;
                  return (
                    <div key={country} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{country}</span>
                        <span className="text-muted-foreground">
                          {count} nodes (
                          {Math.round((count / data.distribution.totalWithGeo) * 100)}
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
              )}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">
              Updated: {new Date(data.generatedAt).toLocaleString()} (
              {data.lookupDurationMs}ms)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

