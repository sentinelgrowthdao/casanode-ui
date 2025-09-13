import { defineStore } from 'pinia';

export interface AuthState {
	token: string | null;
	refreshToken: string | null;
}

export const useAuthStore = defineStore('auth', {
	persist: true,
	state: (): AuthState => ({ token: null, refreshToken: null }),
	actions: {
		setTokens(token: string, refreshToken?: string | null) 
		{
			this.token = token;
			this.refreshToken = refreshToken ?? null;
		},
		clear() 
		{
			this.token = null;
			this.refreshToken = null;
		}
	}
});

