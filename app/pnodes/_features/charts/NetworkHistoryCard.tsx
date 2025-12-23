"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useQuery } from "@/lib/query/client";
import { getNetworkHistory } from "@/app/pnodes/_features/api";
import { formatBytes } from "@/lib/utils";

type Range = "24h" | "7d" | "30d";

export function NetworkHistoryCard() {
  const [range, setRange] = useState<Range>("24h");

  const query = useQuery({
    queryKey: ["history", "network", range],
    queryFn: () => getNetworkHistory(range),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const points = (query.data?.points ?? [])
    .map((p) => ({
      ts: new Date(p.ts).toLocaleString(),
      committed: p.totalStorageCommittedBytes,
      used: p.totalStorageUsedBytes,
      publicPods: p.publicPods,
      totalPods: p.totalPods,
    }))
    .reverse();

  const storageConfig = {
    committed: { label: "Committed", color: "var(--chart-3)" },
    used: { label: "Used", color: "var(--chart-2)" },
  } as const;

  const networkSizeConfig = {
    totalPods: { label: "Total pNodes", color: "var(--chart-1)" },
    publicPods: { label: "Public pNodes", color: "var(--chart-2)" },
  } as const;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Network Trends</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Historical view of network storage and size over time
          </p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-6">
        {query.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : query.error ? (
          <div className="text-sm text-muted-foreground">
            Historical data unavailable: {query.error.message}
          </div>
        ) : (
          <>
            {/* Storage Trends */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Storage</h3>
              <ChartContainer config={storageConfig} className="h-[200px] sm:h-[240px] lg:h-[260px] w-full">
                <AreaChart data={points} accessibilityLayer>
                  <defs>
                    <linearGradient id="committedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-committed)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-committed)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="usedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-used)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-used)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="ts" tickLine={false} axisLine={false} hide />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatBytes(v)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{name}</span>
                            <span className="text-muted-foreground">
                              {typeof value === "number" ? formatBytes(value) : String(value)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="committed"
                    stroke="var(--color-committed)"
                    fill="url(#committedGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="used"
                    stroke="var(--color-used)"
                    fill="url(#usedGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* Network Size Trends */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Network Size</h3>
              <ChartContainer config={networkSizeConfig} className="h-[200px] sm:h-[240px] lg:h-[260px] w-full">
                <AreaChart data={points} accessibilityLayer>
                  <defs>
                    <linearGradient id="totalPodsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-totalPods)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-totalPods)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="publicPodsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-publicPods)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-publicPods)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="ts" tickLine={false} axisLine={false} hide />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPods"
                    stroke="var(--color-totalPods)"
                    fill="url(#totalPodsGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="publicPods"
                    stroke="var(--color-publicPods)"
                    fill="url(#publicPodsGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


