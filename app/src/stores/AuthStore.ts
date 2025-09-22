import { defineStore } from 'pinia';

export interface AuthState
{
	token: string | null;
	refreshToken: string | null;
	expiresAt: number | null;
	lastIp: string | null;
	lastPort: number | null;
	invalidReason: string | null;
}

export const useAuthStore = defineStore('auth', {
	persist: true,
	state: (): AuthState => ({ token: null, refreshToken: null, expiresAt: null, lastIp: null, lastPort: null, invalidReason: null }),
	actions: {
		setTokens(token: string, refreshToken?: string | null, expiresAt?: number | null)
		{
			this.token = token;
			this.refreshToken = refreshToken ?? this.refreshToken ?? null;
			if (typeof expiresAt === 'number')
			{
				this.expiresAt = expiresAt;
			}
			else if (expiresAt === null)
			{
				this.expiresAt = null;
			}
		},
		setLastEndpoint(ip?: string | null, port?: number | null)
		{
			if (ip) this.lastIp = ip;
			if (typeof port === 'number' && port > 0) this.lastPort = port;
		},
		invalidate(reason?: string)
		{
			this.token = null;
			this.refreshToken = null;
			this.expiresAt = null;
			this.invalidReason = reason || 'Session expired. Please rescan the QR code.';
		},
		setExpiry(expiresAt: number | null)
		{
			this.expiresAt = expiresAt;
		},
		clear()
		{
			this.token = null;
			this.refreshToken = null;
			this.expiresAt = null;
			this.lastIp = null;
			this.lastPort = null;
			this.invalidReason = null;
		}
	}
});
