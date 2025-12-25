/**
 * Authorization utilities for cron endpoints
 */

/**
 * Authorize a cron request using Bearer token
 */
export function authorizeCronRequest(request: Request): boolean {
	const authHeader = request.headers.get("Authorization");
	const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

	return authHeader === expectedAuth;
}

