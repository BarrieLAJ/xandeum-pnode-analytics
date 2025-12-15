import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HomeHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 md:p-12">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-2/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          <span className="h-2 w-2 rounded-full bg-chart-2 animate-pulse mr-2" />
          Live Network Data
        </Badge>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Xandeum pNode Analytics
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Real-time monitoring and analytics for Xandeum&apos;s decentralized storage
          network. Track pNode health, version distribution, and network status.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/pnodes">
              View All pNodes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

