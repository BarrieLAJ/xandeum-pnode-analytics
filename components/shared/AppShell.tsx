"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Server, GitCompare, Info, ExternalLink } from "lucide-react";

const navigation = [
	{ name: "pNodes", href: "/pnodes", icon: Server },
	{ name: "Compare", href: "/compare", icon: GitCompare },
	{ name: "About", href: "/about", icon: Info },
];

interface AppShellProps {
	children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-background gradient-mesh">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
				<div className="mx-auto max-w-[160rem] px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						{/* Logo */}
						<Link href="/pnodes" className="flex items-center gap-3 group">
							<div className="relative">
								<div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
									<Server className="h-5 w-5 text-primary" />
								</div>
								<div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-chart-2 border-2 border-background animate-pulse" />
							</div>
							<div className="flex flex-col">
								<span className="font-semibold text-foreground tracking-tight">
									Xandeum
								</span>
								<span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
									pNode Analytics
								</span>
							</div>
						</Link>

						{/* Navigation */}
						<nav className="hidden md:flex items-center gap-1">
							{navigation.map((item) => {
								const isActive = pathname.startsWith(item.href);
								return (
									<Link
										key={item.name}
										href={item.href}
										className={cn(
											"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
											isActive
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
										)}
									>
										<item.icon className="h-4 w-4" />
										{item.name}
									</Link>
								);
							})}
						</nav>

						{/* External links */}
						<div className="flex items-center gap-2">
							<a
								href="https://xandeum.network"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								Xandeum
								<ExternalLink className="h-3 w-3" />
							</a>
							<a
								href="https://discord.gg/uqRSmmM5m"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
							>
								Discord
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					</div>
				</div>

				{/* Mobile navigation */}
				<nav className="md:hidden border-t border-border/50 px-4 py-2 flex gap-1 overflow-x-auto">
					{navigation.map((item) => {
						const isActive = pathname.startsWith(item.href);
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
									isActive
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<item.icon className="h-3.5 w-3.5" />
								{item.name}
							</Link>
						);
					})}
				</nav>
			</header>

			{/* Main content */}
			<main className="mx-auto max-w-[160rem] px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>

			{/* Footer */}
			<footer className="border-t border-border/50 mt-auto">
				<div className="mx-auto max-w-[160rem] px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
						<p>
							Built for the{" "}
							<a
								href="https://xandeum.network"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								Xandeum
							</a>
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
