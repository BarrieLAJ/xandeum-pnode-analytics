"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";
import { useGeoDistributionData } from "./hooks/useGeoDistribution";
import { GeoDistributionHeader } from "./geo/GeoDistributionHeader";
import { GeoDistributionContent } from "./geo/GeoDistributionContent";

export function GeoDistribution() {
	const {
		data,
		isLoading: loading,
		error,
		loadGeoData,
		hasData,
	} = useGeoDistributionData();

	const fetchGeoData = () => {
		loadGeoData();
	};

	return (
		<Card className="animate-fade-in stagger-4">
			<GeoDistributionHeader
				loading={loading}
				hasData={hasData}
				onLoad={fetchGeoData}
			/>
			<CardContent>
				{error && (
					<div className="text-sm text-destructive mb-4">Error: {error.message}</div>
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
						<p className="text-sm text-muted-foreground">Looking up locations...</p>
						<p className="text-xs mt-2 text-muted-foreground opacity-70">
							This may take a moment
						</p>
					</div>
				)}

				{data && <GeoDistributionContent data={data} />}
			</CardContent>
		</Card>
	);
}
