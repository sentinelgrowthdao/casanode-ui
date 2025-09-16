
/**
 * Get the expiration time of a JWT token.
 * @param token The JWT token.
 * @returns The expiration time in milliseconds since the epoch, or null if it cannot be determined.
 */
export function getJwtExpiration(token: string): number | null
{
	try
	{
		if (!token) return null;
		const parts = token.split('.');
		if (parts.length < 2) return null;
		const payload = decodeBase64Url(parts[1]);
		const parsed = JSON.parse(payload || '{}');
		const exp = typeof parsed.exp === 'number' ? parsed.exp : null;
		return exp ? exp * 1000 : null;
	}
	catch (error)
	{
		console.warn('Unable to decode JWT payload', error);
		return null;
	}
}

function decodeBase64Url(segment: string): string
{
	const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
	const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
	const base64 = normalized + padding;
	if (typeof atob === 'function')
	{
		return atob(base64);
	}
	const globalBuffer = (globalThis as any)?.Buffer;
	if (globalBuffer)
	{
		return globalBuffer.from(base64, 'base64').toString('utf-8');
	}
	throw new Error('No base64 decoder available');
}
