"use client";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { GeoApiResponse } from "../api";

interface GeoDistributionContentProps {
  data: GeoApiResponse;
}

export function GeoDistributionContent({ data }: GeoDistributionContentProps) {
  const sortedCountries = Object.entries(data.distribution.byCountry)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const maxCountryCount = sortedCountries.length > 0 ? (sortedCountries[0][1] as number) : 0;

  return (
    <CardContent>
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
              const countNum = count as number;
              const percentage = (countNum / maxCountryCount) * 100;
              return (
                <div key={country} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{country}</span>
                    <span className="text-muted-foreground">
                      {countNum} nodes (
                      {Math.round((countNum / data.distribution.totalWithGeo) * 100)}
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
    </CardContent>
  );
}

