"use client";

import { PnodeRow, SnapshotResponse } from "@/lib/pnodes/model";

interface CompareTableRowProps {
  label: string;
  selectedNodes: PnodeRow[];
  snapshot: SnapshotResponse;
  renderCell: (node: PnodeRow) => React.ReactNode;
}

export function CompareTableRow({
  label,
  selectedNodes,
  snapshot,
  renderCell,
}: CompareTableRowProps) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="p-4 font-medium text-muted-foreground">{label}</td>
      {selectedNodes.map((node) => (
        <td key={node.pubkey} className="p-4">
          {renderCell(node)}
        </td>
      ))}
    </tr>
  );
}
