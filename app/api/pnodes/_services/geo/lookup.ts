/**
 * IP Geolocation lookup - high-level orchestration using geo providers
 *
 * Note: The underlying ip-api.com service has rate limits (45 requests/minute for free tier)
 * Use sparingly and cache results
 */

import { getIpApiProvider } from "./ipApiProvider";
import type { GeoLocation } from "./provider";

// Re-export the GeoLocation type for backwards compatibility
export type { GeoLocation } from "./provider";

// Extended GeoLocation with extra fields (for backwards compatibility)
export interface GeoLocationExtended extends GeoLocation {
	ip: string;
	region?: string;
	regionName?: string;
	org?: string;
	as?: string;
}

/**
 * Lookup geolocation for a single IP
 */
export async function lookupIp(
	ip: string
): Promise<GeoLocationExtended | null> {
	const provider = getIpApiProvider();
	const result = await provider.lookup(ip);

	if (!result.success || !result.geo) {
		return null;
	}

	// Return extended format for backwards compatibility
	return {
		ip,
		...result.geo,
	};
}

/**
 * Batch lookup with rate limiting
 * Processes IPs with delays to avoid hitting rate limits
 */
export async function batchLookupIps(
	ips: string[],
	delayMs = 100
): Promise<Map<string, GeoLocationExtended | null>> {
	const provider = getIpApiProvider();
	const results = new Map<string, GeoLocationExtended | null>();
	const uniqueIps = [...new Set(ips.filter(Boolean))];

	for (const ip of uniqueIps) {
		// Check provider cache
		const cached = provider.getCached(ip);
		if (cached !== undefined) {
			results.set(ip, cached ? { ip, ...cached } : null);
			continue;
		}

		// Lookup with delay
		const geo = await lookupIp(ip);
		results.set(ip, geo);

		// Small delay to avoid rate limiting
		if (delayMs > 0 && uniqueIps.indexOf(ip) < uniqueIps.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}

	return results;
}

/**
 * Get cached geolocation (returns undefined if not cached)
 */
export function getCachedGeo(
	ip: string
): GeoLocationExtended | null | undefined {
	const provider = getIpApiProvider();
	const cached = provider.getCached(ip);
	if (cached === undefined) return undefined;
	if (cached === null) return null;
	return { ip, ...cached };
}

/**
 * Calculate geographic distribution from geo data
 */
export function calculateGeoDistribution(
	geoData: Map<string, GeoLocation | null>
): {
	byCountry: Record<string, number>;
	byCity: Record<string, number>;
	byIsp: Record<string, number>;
	totalWithGeo: number;
	totalWithoutGeo: number;
} {
	const byCountry: Record<string, number> = {};
	const byCity: Record<string, number> = {};
	const byIsp: Record<string, number> = {};
	let totalWithGeo = 0;
	let totalWithoutGeo = 0;

	for (const geo of geoData.values()) {
		if (geo) {
			totalWithGeo++;
			byCountry[geo.country] = (byCountry[geo.country] || 0) + 1;
			byCity[`${geo.city}, ${geo.countryCode}`] =
				(byCity[`${geo.city}, ${geo.countryCode}`] || 0) + 1;
			if (geo.isp) {
				byIsp[geo.isp] = (byIsp[geo.isp] || 0) + 1;
			}
		} else {
			totalWithoutGeo++;
		}
	}

	return { byCountry, byCity, byIsp, totalWithGeo, totalWithoutGeo };
}

