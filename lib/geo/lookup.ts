/**
 * IP Geolocation lookup using free ip-api.com service
 * 
 * Note: This service has rate limits (45 requests/minute for free tier)
 * Use sparingly and cache results
 */

export interface GeoLocation {
  ip: string;
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
}

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

const GEO_CACHE = new Map<string, GeoLocation | null>();

/**
 * Lookup geolocation for a single IP
 */
export async function lookupIp(ip: string): Promise<GeoLocation | null> {
  // Check cache first
  if (GEO_CACHE.has(ip)) {
    return GEO_CACHE.get(ip) ?? null;
  }

  try {
    // Use ip-api.com (free tier: 45 req/min)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,as,query`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      GEO_CACHE.set(ip, null);
      return null;
    }

    const data: IpApiResponse = await response.json();

    if (data.status !== "success") {
      GEO_CACHE.set(ip, null);
      return null;
    }

    const geo: GeoLocation = {
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      lat: data.lat,
      lon: data.lon,
      isp: data.isp,
      org: data.org,
      as: data.as,
    };

    GEO_CACHE.set(ip, geo);
    return geo;
  } catch {
    GEO_CACHE.set(ip, null);
    return null;
  }
}

/**
 * Batch lookup with rate limiting
 * Processes IPs with delays to avoid hitting rate limits
 */
export async function batchLookupIps(
  ips: string[],
  delayMs = 100
): Promise<Map<string, GeoLocation | null>> {
  const results = new Map<string, GeoLocation | null>();
  const uniqueIps = [...new Set(ips.filter(Boolean))];

  for (const ip of uniqueIps) {
    // Check cache
    if (GEO_CACHE.has(ip)) {
      results.set(ip, GEO_CACHE.get(ip) ?? null);
      continue;
    }

    // Lookup with delay
    const geo = await lookupIp(ip);
    results.set(ip, geo);

    // Small delay to avoid rate limiting
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Get cached geolocation (returns null if not cached)
 */
export function getCachedGeo(ip: string): GeoLocation | null | undefined {
  return GEO_CACHE.get(ip);
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

