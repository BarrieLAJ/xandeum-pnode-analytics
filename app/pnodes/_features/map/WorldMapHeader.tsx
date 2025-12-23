"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Loader2, RefreshCw } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface WorldMapHeaderProps {
	markerCount: number;
	loading: boolean;
	hasData: boolean;
	onLoad: () => void;
}

export function WorldMapHeader({
	markerCount,
	loading,
	hasData,
	onLoad,
}: WorldMapHeaderProps) {
	return (
		<CardHeader className="flex flex-row items-center justify-between">
			<CardTitle className="flex items-center gap-2">
				<Globe className="h-5 w-5 text-primary" />
				pNode World Map
			</CardTitle>
			<div className="flex items-center gap-2">
				{hasData && <Badge variant="secondary">{markerCount} located</Badge>}
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
							Load Map
						</>
					)}
				</Button>
			</div>
		</CardHeader>
	);
}
