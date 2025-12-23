/**
 * Credits service for fetching pod credits from Xandeum Credits API
 */

const CREDITS_API_URL = "https://podcredits.xandeum.network/api/pods-credits";

export interface PodCredits {
	pod_id: string;
	credits: number;
}

export interface CreditsResponse {
	pods_credits: PodCredits[];
}

/**
 * Fetch credits for all pods from the Xandeum Credits API
 * Uses Next.js fetch with caching for server-side rendering
 * 
 * Returns empty map on any error - credits are optional and should not break the app
 */
export async function fetchPodCredits(): Promise<Map<string, number>> {
	try {
		const response = await fetch(CREDITS_API_URL, {
			next: { revalidate: 60 }, // Cache for 60 seconds (Next.js server-side)
			headers: {
				"Accept": "application/json",
			},
		});

		// Handle non-OK responses gracefully - don't throw, just return empty map
		if (!response.ok) {
			console.warn(
				`Credits API returned ${response.status}: ${response.statusText}. Continuing without credits data.`
			);
			return new Map();
		}

		const data = (await response.json()) as CreditsResponse;

		// Convert array to Map for O(1) lookup by pubkey
		const creditsMap = new Map<string, number>();
		if (data.pods_credits && Array.isArray(data.pods_credits)) {
			for (const pod of data.pods_credits) {
				if (pod.pod_id && typeof pod.credits === "number") {
					creditsMap.set(pod.pod_id, pod.credits);
				}
			}
		}

		return creditsMap;
	} catch (error) {
		// Log error but don't throw - credits are optional
		console.warn("Failed to fetch pod credits:", error instanceof Error ? error.message : String(error));
		// Return empty map on error - don't break the app if credits API is down
		return new Map();
	}
}

/**
 * Get credits for a specific pod by pubkey
 */
export async function getPodCredits(pubkey: string): Promise<number | null> {
	const creditsMap = await fetchPodCredits();
	return creditsMap.get(pubkey) ?? null;
}

