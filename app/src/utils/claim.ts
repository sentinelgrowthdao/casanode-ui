export interface ClaimPayload
{
	deviceId: string;
	claimCode: string;
	ap: string;
	pw: string;
	host: string;
	fp?: string;
	// Development fallback fields (when scanning is unavailable)
	authToken?: string;
	apiPort?: number;
}

export function parseClaimUrl(raw: string): ClaimPayload
{
	const url = new URL(raw);
	return {
		deviceId: url.searchParams.get('device') || '',
		claimCode: url.searchParams.get('code') || '',
		ap: url.searchParams.get('ap') || '',
		pw: url.searchParams.get('pw') || '',
		host: url.searchParams.get('host') || '192.168.50.1',
		fp: url.searchParams.get('fp') || undefined
	};
}
