"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, TrendingUp, ExternalLink } from "lucide-react";
import { PnodeRow } from "@/lib/pnodes/model";
import { cn, formatBytes, formatDurationSeconds } from "@/lib/utils";
import Link from "next/link";

interface StakingRecommendationsProps {
	rows: PnodeRow[];
	topN?: number;
}

/**
 * Staking recommendations card showing top nodes for staking
 */
export function StakingRecommendations({
	rows,
	topN = 5,
}: StakingRecommendationsProps) {
	const topNodes = useMemo(() => {
		return [...rows]
			.filter((row) => row.derived.stakingScore !== undefined && row.derived.stakingScore !== null)
			.sort((a, b) => (b.derived.stakingScore ?? 0) - (a.derived.stakingScore ?? 0))
			.slice(0, topN);
	}, [rows, topN]);

	if (topNodes.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						Staking Recommendations
					</CardTitle>
					<CardDescription>
						No nodes with staking scores available yet.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const tierColors = {
		A: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50",
		B: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50",
		C: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
		D: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50",
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-primary" />
							Top Staking Recommendations
						</CardTitle>
						<CardDescription className="mt-1">
							Top {topN} nodes ranked by staking score. This is a heuristic based on
							reliability, performance, uptime, credits, and capacity.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{topNodes.map((node, index) => {
						const score = node.derived.stakingScore ?? 0;
						const tier = node.derived.stakingTier;
						const reasons = node.derived.stakingReasons ?? [];

						return (
							<div
								key={node.pubkey}
								className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-sm font-medium text-muted-foreground">
											#{index + 1}
										</span>
										<code className="text-sm font-mono">
											{node.derived.shortPubkey}
										</code>
										{tier && (
											<Badge
												variant="outline"
												className={cn(
													"font-mono text-xs font-semibold",
													tierColors[tier]
												)}
											>
												{tier} ({score})
											</Badge>
										)}
									</div>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
										{node.pod?.credits !== undefined &&
											node.pod.credits !== null && (
												<div>
													<span className="font-medium">Credits:</span>{" "}
													{node.pod.credits.toLocaleString()}
												</div>
											)}
										{node.pod?.uptimeSeconds !== undefined && (
											<div>
												<span className="font-medium">Uptime:</span>{" "}
												{formatDurationSeconds(node.pod.uptimeSeconds)}
											</div>
										)}
										{node.pod?.storageCommittedBytes !== undefined && (
											<div>
												<span className="font-medium">Storage:</span>{" "}
												{formatBytes(node.pod.storageCommittedBytes)}
											</div>
										)}
										{node.probe?.latencyMs !== undefined && (
											<div>
												<span className="font-medium">Latency:</span>{" "}
												{node.probe.latencyMs}ms
											</div>
										)}
									</div>
									{reasons.length > 0 && (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="mt-2 flex flex-wrap gap-1">
														{reasons.slice(0, 3).map((reason, i) => (
															<Badge
																key={i}
																variant="secondary"
																className="text-xs"
															>
																{reason}
															</Badge>
														))}
														{reasons.length > 3 && (
															<Badge variant="secondary" className="text-xs">
																+{reasons.length - 3} more
															</Badge>
														)}
													</div>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<div className="space-y-1">
														<p className="font-semibold text-sm">Score Factors:</p>
														<ul className="text-xs space-y-0.5">
															{reasons.map((reason, i) => (
																<li key={i}>• {reason}</li>
															))}
														</ul>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									)}
								</div>
								<Link href={`/pnodes/${node.pubkey}`}>
									<Button variant="ghost" size="sm" className="gap-1">
										View
										<ExternalLink className="h-3 w-3" />
									</Button>
								</Link>
							</div>
						);
					})}
				</div>
				<div className="mt-4 pt-4 border-t">
					<div className="flex items-start gap-2 text-xs text-muted-foreground">
						<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
						<p>
							<strong>Disclaimer:</strong> This scoring is a heuristic based on available
							metrics and is not official staking advice. Always do your own research
							before staking XAND.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

