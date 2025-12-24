"use client";

import Link from "next/link";
import { PnodeRow } from "@/lib/pnodes/model";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StatusBadge, VersionBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { formatBytes } from "@/lib/utils";
import { ExternalLink, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PnodeCardDetailsProps {
	row: PnodeRow | null;
	modalVersion: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Drawer component showing detailed information about a pNode (slides from bottom on mobile)
 */
export function PnodeCardDetails({
	row,
	modalVersion,
	open,
	onOpenChange,
}: PnodeCardDetailsProps) {
	if (!row) return null;

	const prpcUrl =
		row.pod?.prpcUrl ??
		(row.endpoints.rpc ? `http://${row.endpoints.rpc}/rpc` : null);

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader>
					<DrawerTitle className="flex items-center gap-2">
						<code className="text-sm font-mono">{row.derived.shortPubkey}</code>
						<CopyButton value={row.pubkey} label="Copy full pubkey" />
					</DrawerTitle>
					<DrawerDescription>
						Detailed information about this pNode
					</DrawerDescription>
				</DrawerHeader>

				<div className="overflow-y-auto px-4 space-y-4">
					{/* Basic Info */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Basic Information</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Version:</span>
								<VersionBadge
									version={row.version}
									modalVersion={modalVersion}
								/>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Status:</span>
								<StatusBadge
									status={row.pod?.isPublic ? "online" : "offline"}
									label={row.pod?.isPublic ? "Public" : "Private"}
								/>
							</div>
							{row.shredVersion !== null && (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Shred Version:</span>
									<span className="font-mono">{row.shredVersion}</span>
								</div>
							)}
							{row.featureSet !== null && (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Feature Set:</span>
									<span className="font-mono">{row.featureSet}</span>
								</div>
							)}
						</div>
					</div>

					{/* Pod Information */}
					{row.pod && (
						<>
							<Separator />
							<div className="space-y-3">
								<h3 className="text-sm font-semibold">Pod Information</h3>
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Address:</span>
										<span className="font-mono text-xs">{row.pod.address}</span>
									</div>
									{row.pod.storageUsedBytes !== undefined && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Storage Used:</span>
											<span className="font-mono">
												{formatBytes(row.pod.storageUsedBytes)}
											</span>
										</div>
									)}
									{row.pod.storageCommittedBytes !== undefined && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">
												Storage Committed:
											</span>
											<span className="font-mono">
												{formatBytes(row.pod.storageCommittedBytes)}
											</span>
										</div>
									)}
									{row.pod.storageUsagePercent !== undefined && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">
												Storage Usage:
											</span>
											<span className="font-mono">
												{row.pod.storageUsagePercent.toFixed(1)}%
											</span>
										</div>
									)}
									{row.pod.credits !== undefined && row.pod.credits !== null && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Credits:</span>
											<span className="font-mono">
												{row.pod.credits.toLocaleString()}
											</span>
										</div>
									)}
									{row.pod.uptimeSeconds !== undefined && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Uptime:</span>
											<span className="font-mono">
												{Math.floor(row.pod.uptimeSeconds / 3600)}h{" "}
												{Math.floor((row.pod.uptimeSeconds % 3600) / 60)}m
											</span>
										</div>
									)}
								</div>
							</div>
						</>
					)}

					{/* Endpoints */}
					{row.derived.endpointCount > 0 && (
						<>
							<Separator />
							<div className="space-y-3">
								<h3 className="text-sm font-semibold">Endpoints</h3>
								<div className="space-y-2 text-sm">
									{row.endpoints.gossip && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Gossip:</span>
											<span className="font-mono text-xs truncate max-w-[200px]">
												{row.endpoints.gossip}
											</span>
										</div>
									)}
									{row.endpoints.rpc && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">RPC:</span>
											<span className="font-mono text-xs truncate max-w-[200px]">
												{row.endpoints.rpc}
											</span>
										</div>
									)}
									{row.endpoints.pubsub && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Pubsub:</span>
											<span className="font-mono text-xs truncate max-w-[200px]">
												{row.endpoints.pubsub}
											</span>
										</div>
									)}
								</div>
							</div>
						</>
					)}

					{/* Probe Results */}
					{row.probe && (
						<>
							<Separator />
							<div className="space-y-3">
								<h3 className="text-sm font-semibold">Probe Results</h3>
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">RPC Reachable:</span>
										<StatusBadge
											status={row.probe.rpcReachable ? "online" : "offline"}
											label={row.probe.rpcReachable ? "Yes" : "No"}
										/>
									</div>
									{row.probe.latencyMs !== undefined && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Latency:</span>
											<span className="font-mono">{row.probe.latencyMs}ms</span>
										</div>
									)}
									{row.probe.rpcVersion && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">RPC Version:</span>
											<span className="font-mono">{row.probe.rpcVersion}</span>
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-2 pt-4 border-t px-4 pb-4">
					<Link href={`/pnodes/${row.pubkey}`} className="w-full">
						<Button className="w-full" variant="default">
							View Full Details
							<ChevronRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
					{prpcUrl && (
						<a
							href={prpcUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full"
						>
							<Button className="w-full" variant="outline">
								Open pRPC Endpoint
								<ExternalLink className="ml-2 h-4 w-4" />
							</Button>
						</a>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}

