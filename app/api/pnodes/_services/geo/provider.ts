/**
 * Geo provider interface - abstracts IP geolocation services
 */

export interface GeoLocation {
	country: string;
	countryCode: string;
	city: string;
	lat: number;
	lon: number;
	isp: string;
}

export interface GeoLookupResult {
	ip: string;
	success: boolean;
	geo: GeoLocation | null;
	error?: string;
}

/**
 * Interface for geo lookup providers
 */
export interface GeoProvider {
	/**
	 * Lookup geo information for a single IP
	 */
	lookup(ip: string): Promise<GeoLookupResult>;

	/**
	 * Lookup geo information for multiple IPs
	 */
	batchLookup(ips: string[]): Promise<GeoLookupResult[]>;

	/**
	 * Get the provider name (for logging/debugging)
	 */
	readonly name: string;
}

