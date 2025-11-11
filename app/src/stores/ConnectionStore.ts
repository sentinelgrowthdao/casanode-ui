import { defineStore } from 'pinia';

export interface ConnectionState {
	ip: string | null;
	port: number | null;
	preSharedToken: string | null;
}

export const useConnectionStore = defineStore('connection', {
	// NOTE: This store is intentionally NOT persisted. Connection parameters
	// should only live for the current runtime session and not survive reloads.
	state: (): ConnectionState => ({
		ip: null,
		port: null,
		preSharedToken: null,
	}),
	actions:
	{
		setConnection(ip?: string | null, port?: number | null, token?: string | null): void {
			this.ip = ip ?? this.ip ?? null;
			this.port = typeof port === 'number' && port > 0 ? port : (this.port ?? null);
			if (token !== undefined)
				this.preSharedToken = token ?? null;
		},
		clear(): void {
			this.ip = null;
			this.port = null;
			this.preSharedToken = null;
		}
	}
});
