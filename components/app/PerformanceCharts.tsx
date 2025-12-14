"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Label,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
} from "lucide-react";
import type { PnodeRow } from "@/lib/pnodes/model";

interface PerformanceChartsProps {
  rows: PnodeRow[];
  modalVersion: string | null;
}

export function PerformanceCharts({
  rows,
  modalVersion,
}: PerformanceChartsProps) {
  const [activeTab, setActiveTab] = useState("version");

  // Version distribution data with dynamic chart config
  const { versionData, versionConfig } = useMemo(() => {
    const distribution: Record<string, number> = {};
    rows.forEach((row) => {
      const version = row.version || "Unknown";
      distribution[version] = (distribution[version] || 0) + 1;
    });

    const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    const config: ChartConfig = {
      count: { label: "Nodes" },
    };

    const data = sorted.map(([version, count], index) => {
      const key = `version_${index}`;
      config[key] = {
        label: version.length > 20 ? version.slice(0, 20) + "..." : version,
        color: chartColors[index % chartColors.length],
      };
      return {
        name: key,
        fullName: version,
        count,
        percentage: Math.round((count / rows.length) * 100),
        fill: `var(--color-${key})`,
      };
    });

    return { versionData: data, versionConfig: config };
  }, [rows]);

  // Endpoint completeness distribution
  const { endpointData, endpointConfig } = useMemo(() => {
    const distribution: Record<number, number> = {};
    rows.forEach((row) => {
      const count = row.derived.endpointCount;
      distribution[count] = (distribution[count] || 0) + 1;
    });

    const config: ChartConfig = {
      count: {
        label: "Nodes",
        color: "var(--chart-1)",
      },
    };

    const data = Object.entries(distribution)
      .map(([count, value]) => ({
        name: `${count}/10`,
        endpoints: parseInt(count),
        count: value,
      }))
      .sort((a, b) => a.endpoints - b.endpoints);

    return { endpointData: data, endpointConfig: config };
  }, [rows]);

  // RPC availability data
  const { rpcData, rpcConfig } = useMemo(() => {
    const withRpc = rows.filter((r) => r.derived.hasRpc).length;
    const withoutRpc = rows.length - withRpc;

    const config: ChartConfig = {
      value: { label: "Nodes" },
      hasRpc: {
        label: "Has RPC",
        color: "var(--chart-2)",
      },
      noRpc: {
        label: "No RPC",
        color: "var(--chart-5)",
      },
    };

    const data = [
      { name: "hasRpc", value: withRpc, fill: "var(--color-hasRpc)" },
      { name: "noRpc", value: withoutRpc, fill: "var(--color-noRpc)" },
    ];

    return { rpcData: data, rpcConfig: config };
  }, [rows]);

  // Latency distribution (if probed)
  const { latencyData, latencyConfig } = useMemo(() => {
    const probedRows = rows.filter(
      (r) => r.probe?.rpcReachable && r.probe.latencyMs
    );

    const config: ChartConfig = {
      count: {
        label: "Nodes",
        color: "var(--chart-2)",
      },
    };

    if (probedRows.length === 0) return { latencyData: null, latencyConfig: config };

    const buckets = [
      { min: 0, max: 50, label: "0-50ms" },
      { min: 50, max: 100, label: "50-100ms" },
      { min: 100, max: 200, label: "100-200ms" },
      { min: 200, max: 500, label: "200-500ms" },
      { min: 500, max: 1000, label: "500ms-1s" },
      { min: 1000, max: Infinity, label: ">1s" },
    ];

    const data = buckets.map((bucket) => ({
      name: bucket.label,
      count: probedRows.filter(
        (r) => r.probe!.latencyMs! >= bucket.min && r.probe!.latencyMs! < bucket.max
      ).length,
    }));

    return { latencyData: data, latencyConfig: config };
  }, [rows]);

  // Scatter plot data for latency vs endpoint count
  const { scatterData, scatterConfig } = useMemo(() => {
    const config: ChartConfig = {
      latency: {
        label: "Latency (ms)",
        color: "var(--chart-1)",
      },
    };

    const data = rows
      .filter((r) => r.probe?.rpcReachable && r.probe.latencyMs)
      .map((r) => ({
        x: r.derived.endpointCount,
        y: r.probe!.latencyMs!,
        pubkey: r.derived.shortPubkey,
        version: r.version,
      }));

    return { scatterData: data, scatterConfig: config };
  }, [rows]);

  const hasProbeData = rows.some((r) => r.probe);
  const totalNodes = rows.length;

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
            <TabsTrigger value="endpoints" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Endpoints</span>
            </TabsTrigger>
            <TabsTrigger value="rpc" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">RPC</span>
            </TabsTrigger>
            <TabsTrigger value="latency" className="gap-1.5" disabled={!hasProbeData}>
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Latency</span>
            </TabsTrigger>
          </TabsList>

          {/* Version Distribution */}
          <TabsContent value="version" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Software version distribution across {rows.length} pNodes
              </p>
              {modalVersion && (
                <Badge variant="outline" className="gap-1.5">
                  Modal: {modalVersion}
                </Badge>
              )}
            </div>
            <ChartContainer config={versionConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{item.payload.fullName}</span>
                          <span className="text-muted-foreground">
                            {value} nodes ({item.payload.percentage}%)
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={versionData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  strokeWidth={2}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {versionData.length}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              versions
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
                <ChartLegend
                  content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />}
                  className="flex-wrap gap-2 *:basis-1/4 *:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </TabsContent>

          {/* Endpoint Completeness */}
          <TabsContent value="endpoints" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Number of advertised endpoints per pNode (out of 10 possible)
            </p>
            <ChartContainer config={endpointConfig} className="h-[300px]">
              <BarChart data={endpointData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{item.payload.endpoints} endpoints</span>
                          <span className="text-muted-foreground">{value} nodes</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          {/* RPC Availability */}
          <TabsContent value="rpc" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              RPC endpoint availability across the network
            </p>
            <ChartContainer config={rpcConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      formatter={(value) => (
                        <span>
                          {value} nodes ({Math.round((Number(value) / totalNodes) * 100)}%)
                        </span>
                      )}
                    />
                  }
                />
                <Pie
                  data={rpcData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                  paddingAngle={3}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const withRpc = rpcData.find((d) => d.name === "hasRpc")?.value || 0;
                        const percent = Math.round((withRpc / totalNodes) * 100);
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {percent}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              have RPC
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
                <ChartLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </TabsContent>

          {/* Latency Distribution */}
          <TabsContent value="latency" className="space-y-4">
            {!hasProbeData ? (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Run RPC probes to see latency distribution</p>
                <p className="text-xs mt-2 opacity-70">
                  Click &quot;Test RPC Health&quot; in the directory
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  RPC response latency distribution
                </p>

                {latencyData && (
                  <ChartContainer config={latencyConfig} className="h-[250px]">
                    <BarChart data={latencyData} accessibilityLayer>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            formatter={(value, name, item) => (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium">{item.payload.name}</span>
                                <span className="text-muted-foreground">{value} nodes</span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}

                {scatterData.length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground mt-6">
                      Latency vs Endpoint Count
                    </p>
                    <ChartContainer config={scatterConfig} className="h-[250px]">
                      <ScatterChart accessibilityLayer>
                        <CartesianGrid />
                        <XAxis
                          dataKey="x"
                          name="Endpoints"
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: "Endpoints",
                            position: "bottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          dataKey="y"
                          name="Latency (ms)"
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          label={{
                            value: "Latency (ms)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <ChartTooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={
                            <ChartTooltipContent
                              formatter={(value, name, item) => (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium font-mono">{item.payload.pubkey}</span>
                                  <span className="text-muted-foreground">Latency: {item.payload.y}ms</span>
                                  <span className="text-muted-foreground">Endpoints: {item.payload.x}/10</span>
                                </div>
                              )}
                            />
                          }
                        />
                        <Scatter data={scatterData} fill="var(--color-latency)" />
                      </ScatterChart>
                    </ChartContainer>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
