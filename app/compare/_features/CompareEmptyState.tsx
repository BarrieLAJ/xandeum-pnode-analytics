"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CompareEmptyState() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No pNodes selected</h3>
        <p className="text-muted-foreground max-w-sm">
          Use the selector above to add pNodes you want to compare. You can select
          up to 4 nodes.
        </p>
      </div>
    </Card>
  );
}

