import { defineStore } from 'pinia';

export interface AuthState
{
	token: string | null;
	refreshToken: string | null;
	expiresAt: number | null;
}

export const useAuthStore = defineStore('auth', {
	persist: true,
	state: (): AuthState => ({ token: null, refreshToken: null, expiresAt: null }),
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
		setExpiry(expiresAt: number | null)
		{
			this.expiresAt = expiresAt;
		},
		clear()
		{
			this.token = null;
			this.refreshToken = null;
			this.expiresAt = null;
		}
	}
});
