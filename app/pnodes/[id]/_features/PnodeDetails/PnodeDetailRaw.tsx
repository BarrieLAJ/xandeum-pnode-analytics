import { PnodeRow } from "@/lib/pnodes/model";
import { CopyButton } from "@/components/shared/CopyButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PnodeDetailRawProps {
  node: PnodeRow;
}

export function PnodeDetailRaw({ node }: PnodeDetailRawProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Raw JSON Response</CardTitle>
        <CopyButton
          value={JSON.stringify(node.raw, null, 2)}
          label="Copy JSON"
          variant="outline"
          size="sm"
        />
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <pre className="p-4 overflow-x-auto text-sm font-mono bg-muted/30 rounded-b-lg">
          {JSON.stringify(node.raw, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

