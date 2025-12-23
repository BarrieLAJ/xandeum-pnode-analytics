"use client";

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MapPin, Loader2, RefreshCw } from "lucide-react";

interface GeoDistributionHeaderProps {
	loading: boolean;
	hasData: boolean;
	onLoad: () => void;
}

export function GeoDistributionHeader({
	loading,
	hasData,
	onLoad,
}: GeoDistributionHeaderProps) {
	return (
		<CardHeader className="flex flex-row items-center justify-between">
			<CardTitle className="flex items-center gap-2">
				<Globe className="h-5 w-5 text-primary" />
				Geographic Distribution
			</CardTitle>
			<Button
				variant="outline"
				size="sm"
				onClick={onLoad}
				disabled={loading}
				className="gap-2"
			>
				{loading ? (
					<>
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
						Loading...
					</>
				) : hasData ? (
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
	);
}
