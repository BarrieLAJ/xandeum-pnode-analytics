"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart3,
	PieChart as PieChartIcon,
	Activity,
	Zap,
} from "lucide-react";
import type { PnodeRow } from "@/lib/pnodes/model";
import {
	VersionDistributionChart,
	EndpointDistributionChart,
	RpcDistributionChart,
	LatencyDistributionChart,
} from ".";

interface PerformanceChartsProps {
	rows: PnodeRow[];
	modalVersion: string | null;
}

export function PerformanceCharts({
	rows,
	modalVersion,
}: PerformanceChartsProps) {
	const [activeTab, setActiveTab] = useState("version");
	const hasProbeData = rows.some((r) => r.probe);

	return (
		<Card className="animate-fade-in">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-primary" />
					Network Analytics
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4 mb-6">
						<TabsTrigger value="version" className="gap-1.5">
							<PieChartIcon className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Versions</span>
						</TabsTrigger>
						<TabsTrigger value="rpc" className="gap-1.5">
							<Activity className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">RPC</span>
						</TabsTrigger>
						<TabsTrigger value="endpoints" className="gap-1.5">
							<BarChart3 className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Endpoints</span>
						</TabsTrigger>
						<TabsTrigger value="latency" className="gap-1.5" disabled={!hasProbeData}>
							<Zap className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Latency</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="version">
						<VersionDistributionChart rows={rows} modalVersion={modalVersion} />
					</TabsContent>

					<TabsContent value="rpc">
						<RpcDistributionChart rows={rows} />
					</TabsContent>

					<TabsContent value="endpoints">
						<EndpointDistributionChart rows={rows} />
					</TabsContent>

					<TabsContent value="latency">
						<LatencyDistributionChart rows={rows} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
