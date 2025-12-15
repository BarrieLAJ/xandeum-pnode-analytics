/**
 * ip-api.com geo provider implementation
 *
 * Note: This service has rate limits (45 requests/minute for free tier)
 * Use sparingly and cache results
 */

import type { GeoProvider, GeoLookupResult, GeoLocation } from "./provider";

interface IpApiResponse {
	status: "success" | "fail";
	message?: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	lat: number;
	lon: number;
	isp: string;
	org: string;
	as: string;
	query: string;
}

/**
 * Configuration options for the ip-api provider
 */
export interface IpApiProviderOptions {
	/** Base URL for the API (defaults to http://ip-api.com, can use https for paid) */
	baseUrl?: string;
	/** Delay between batch requests in ms (default: 100ms) */
	batchDelayMs?: number;
}

/**
 * ip-api.com implementation of the GeoProvider interface
 */
export class IpApiProvider implements GeoProvider {
	readonly name = "ip-api";
	private readonly baseUrl: string;
	private readonly batchDelayMs: number;
	private readonly cache = new Map<string, GeoLocation | null>();

	constructor(options: IpApiProviderOptions = {}) {
		// Allow override via env var or options
		this.baseUrl =
			options.baseUrl ||
			process.env.GEOLOOKUP_BASE_URL ||
			"http://ip-api.com";
		this.batchDelayMs = options.batchDelayMs ?? 100;
	}

	async lookup(ip: string): Promise<GeoLookupResult> {
		// Check cache first
		if (this.cache.has(ip)) {
			const cached = this.cache.get(ip);
			return {
				ip,
				success: cached !== null,
				geo: cached ?? null,
			};
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,as,query`,
				{ next: { revalidate: 86400 } } // Cache for 24 hours
			);

			if (!response.ok) {
				this.cache.set(ip, null);
				return {
					ip,
					success: false,
					geo: null,
					error: `HTTP ${response.status}`,
				};
			}

			const data: IpApiResponse = await response.json();

			if (data.status !== "success") {
				this.cache.set(ip, null);
				return {
					ip,
					success: false,
					geo: null,
					error: data.message || "Lookup failed",
				};
			}

			const geo: GeoLocation = {
				country: data.country,
				countryCode: data.countryCode,
				city: data.city,
				lat: data.lat,
				lon: data.lon,
				isp: data.isp,
			};

			this.cache.set(ip, geo);
			return {
				ip,
				success: true,
				geo,
			};
		} catch (err) {
			this.cache.set(ip, null);
			return {
				ip,
				success: false,
				geo: null,
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	}

	async batchLookup(ips: string[]): Promise<GeoLookupResult[]> {
		const uniqueIps = [...new Set(ips.filter(Boolean))];
		const results: GeoLookupResult[] = [];

		for (const ip of uniqueIps) {
			// Check cache
			if (this.cache.has(ip)) {
				const cached = this.cache.get(ip);
				results.push({
					ip,
					success: cached !== null,
					geo: cached ?? null,
				});
				continue;
			}

			// Lookup with delay
			const result = await this.lookup(ip);
			results.push(result);

			// Small delay to avoid rate limiting
			if (
				this.batchDelayMs > 0 &&
				uniqueIps.indexOf(ip) < uniqueIps.length - 1
			) {
				await new Promise((resolve) =>
					setTimeout(resolve, this.batchDelayMs)
				);
			}
		}

		return results;
	}

	/**
	 * Get cached geo data (returns undefined if not cached)
	 */
	getCached(ip: string): GeoLocation | null | undefined {
		return this.cache.get(ip);
	}

	/**
	 * Clear the cache
	 */
	clearCache(): void {
		this.cache.clear();
	}
}

/**
 * Default provider instance
 */
let defaultProvider: IpApiProvider | null = null;

/**
 * Get the default ip-api provider (singleton)
 */
export function getIpApiProvider(): IpApiProvider {
	if (!defaultProvider) {
		defaultProvider = new IpApiProvider();
	}
	return defaultProvider;
}

