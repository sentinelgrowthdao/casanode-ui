import { registerPlugin } from '@capacitor/core';

export interface HttpGetRequest {
	url: string;
	fingerprintSha256?: string;
	headers?: Record<string, string>;
	timeoutMs?: number;
}

export interface HttpResponse<T = any> {
	status: number;
	data?: T;
	error?: string;
}

export const CasaHttp = registerPlugin<{
	get<T = any>(options: HttpGetRequest): Promise<HttpResponse<T>>;
		}>('CasaHttp');