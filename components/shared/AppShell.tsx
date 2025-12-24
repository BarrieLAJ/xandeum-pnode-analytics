"use client";

import Link from "next/link";
import Image from "next/image";
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
				<div className="mx-auto max-w-640 px-4 sm:px-6 lg:px-8">
					<div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
						{/* Logo */}
						<Link
							href="/pnodes"
							className="flex items-center gap-2 sm:gap-3 group shrink-0"
						>
							<div className="flex flex-col">
								<div className="relative h-6 w-24 sm:h-8 sm:w-34 shrink-0">
									<Image
										src="/logo.png"
										alt="Xandeum Logo"
										fill
										className="object-contain"
										priority
									/>
								</div>
								<span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
									pNode Analytics
								</span>
							</div>
						</Link>

						{/* Navigation - Desktop */}
						<nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
							{navigation.map((item) => {
								const isActive = pathname.startsWith(item.href);
								return (
									<Link
										key={item.name}
										href={item.href}
										className={cn(
											"flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all",
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
						<div className="flex items-center gap-1 sm:gap-2 shrink-0">
							<a
								href="https://xandeum.network"
								target="_blank"
								rel="noopener noreferrer"
								className="hidden sm:flex items-center gap-1.5 px-2 xl:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								<span className="hidden xl:inline">Xandeum</span>
								<ExternalLink className="h-3 w-3" />
							</a>
							<a
								href="https://discord.gg/uqRSmmM5m"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 px-2 xl:px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
							>
								<span className="hidden sm:inline">Discord</span>
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					</div>
				</div>

				{/* Mobile navigation */}
				<nav className="lg:hidden border-t border-border/50 px-4 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
					{navigation.map((item) => {
						const isActive = pathname.startsWith(item.href);
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all shrink-0",
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
