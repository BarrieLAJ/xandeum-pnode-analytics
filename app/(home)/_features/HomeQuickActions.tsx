import Link from "next/link";
import { GitBranch, Globe, Server } from "lucide-react";

export function HomeQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link
        href="/pnodes"
        className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
      >
        <Server className="h-8 w-8 text-primary mb-4" />
        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
          Browse Directory
        </h3>
        <p className="text-sm text-muted-foreground">
          View all pNodes with search, filter, and sort capabilities.
        </p>
      </Link>

      <Link
        href="/compare"
        className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
      >
        <GitBranch className="h-8 w-8 text-primary mb-4" />
        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
          Compare Nodes
        </h3>
        <p className="text-sm text-muted-foreground">
          Side-by-side comparison of pNode configurations.
        </p>
      </Link>

      <Link
        href="/about"
        className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
      >
        <Globe className="h-8 w-8 text-primary mb-4" />
        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
          Methodology
        </h3>
        <p className="text-sm text-muted-foreground">
          Learn how data is collected and what metrics mean.
        </p>
      </Link>
    </div>
  );
}

