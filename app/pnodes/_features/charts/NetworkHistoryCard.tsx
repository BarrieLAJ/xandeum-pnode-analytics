"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
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

  const config = {
    committed: { label: "Committed", color: "hsl(var(--chart-3))" },
    used: { label: "Used", color: "hsl(var(--chart-2))" },
    publicPods: { label: "Public pods", color: "hsl(var(--chart-1))" },
  } as const;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Historical Storage (Network)</CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : query.error ? (
          <div className="text-sm text-muted-foreground">
            Historical data unavailable: {query.error.message}
          </div>
        ) : (
          <ChartContainer config={config} className="h-[280px]">
            <LineChart data={points} accessibilityLayer>
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
              <Line
                type="monotone"
                dataKey="committed"
                stroke="var(--color-committed)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="used"
                stroke="var(--color-used)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}


