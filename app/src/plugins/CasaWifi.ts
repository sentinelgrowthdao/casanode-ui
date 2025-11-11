import { registerPlugin } from '@capacitor/core';

export interface WifiJoinRequest
{
	ssid: string;
	passphrase?: string;
	timeoutMs?: number;
}

export interface WifiJoinResult
{
	connected: boolean;
	error?: string;
}

export const CasaWifi = registerPlugin<{
	join(options: WifiJoinRequest): Promise<WifiJoinResult>;
}>('CasaWifi');