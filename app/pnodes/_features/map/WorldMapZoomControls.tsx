"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface WorldMapZoomControlsProps {
	zoom: number;
	onZoomIn: () => void;
	onZoomOut: () => void;
}

export function WorldMapZoomControls({
	zoom,
	onZoomIn,
	onZoomOut,
}: WorldMapZoomControlsProps) {
	return (
		<div className="flex items-center justify-end gap-2">
			<Button
				variant="outline"
				size="icon"
				className="h-8 w-8"
				onClick={onZoomOut}
			>
				<ZoomOut className="h-4 w-4" />
			</Button>
			<span className="text-xs text-muted-foreground w-12 text-center">
				{zoom.toFixed(1)}x
			</span>
			<Button variant="outline" size="icon" className="h-8 w-8" onClick={onZoomIn}>
				<ZoomIn className="h-4 w-4" />
			</Button>
		</div>
	);
}
