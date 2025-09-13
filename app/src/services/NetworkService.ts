import ApiService, { type ApiInfos } from '@services/ApiService';
import {
	type NetworkStatus,
	type NetworkConfiguration,
	type NetworkInstallationCheck,
	type NetworkInstallConfiguration,
	type NetworkInstallDocker,
	type NodeConfigResults,
	type NetworkPassphrase
} from '@interfaces/network';
import { type NodeBalance } from '@stores/NodeStore';

class NetworkService 
{
	private static instance: NetworkService;
	
	private constructor() {}

	public static getInstance(): NetworkService 
	{
		if (!NetworkService.instance) 
		{
			NetworkService.instance = new NetworkService();
		}
		return NetworkService.instance;
	}

	public async connect(data: { ip?: string; port?: number; token?: string }): Promise<boolean> 
	{
		const ip = data.ip ?? '';
		const port = data.port ?? 0;
		const token = data.token ?? '';
		return ApiService.connect(ip, port, token);
	}

	/**
	 * Authenticate against API and retrieve JWT
	 */
	public async login(preSharedToken?: string): Promise<{ token: string; refreshToken?: string } | null>
	{
		return await ApiService.login(preSharedToken);
	}

	/**
	 * Set current Authorization token
	 */
	public setAuthToken(token: string | null): void
	{
		ApiService.setAuthToken(token);
	}

	/**
	 * Get current Authorization token
	 */
	public getAuthToken(): string | null
	{
		return ApiService.getAuthToken();
	}

	public async reconnect(): Promise<boolean> 
	{
		return ApiService.reconnect();
	}

	public async disconnect(): Promise<void> 
	{
		await ApiService.disconnect();
	}

	public isConnected(): boolean 
	{
		return ApiService.isConnected();
	}

	public getConnector(): string | undefined 
	{
		return this.isConnected() ? 'tcp' : undefined;
	}

	public getDeviceUuid(): string | undefined 
	{
		return ApiService.getDeviceUuid();
	}

	public getApiInfos(): ApiInfos | null 
	{
		return ApiService.getApiInfos();
	}

	public async getNodeStatus(): Promise<string> 
	{
		return await ApiService.getNodeStatus();
	}

	public async getStatus(): Promise<NetworkStatus> 
	{
		return await ApiService.getStatus();
	}

	public async getNodeConfiguration(): Promise<NetworkConfiguration> 
	{
		return await ApiService.getNodeConfiguration();
	}

	public async setNodeConfiguration(config: NetworkConfiguration): Promise<NodeConfigResults> 
	{
		return await ApiService.setNodeConfiguration(config);
	}

	public async getNodeAddress(): Promise<string | null> 
	{
		return await ApiService.getNodeAddress();
	}

	public async getWalletAddress(): Promise<string | null> 
	{
		return await ApiService.getWalletAddress();
	}

	public async getNodeBalance(): Promise<NodeBalance | null> 
	{
		const raw = await ApiService.getNodeBalance();
		if (raw) 
		{
			const match = raw.match(/^(\d+(?:\.\d+)?)\s([A-Za-z]+)/);
			if (match) 
			{
				return { amount: parseFloat(match[1]), denom: match[2] };
			}
		}
		return null;
	}

	public async checkInstallation(): Promise<NetworkInstallationCheck> 
	{
		return await ApiService.checkInstallation();
	}

	public async installDockerImage(): Promise<NetworkInstallDocker> 
	{
		return await ApiService.installDockerImage();
	}

	public async installNodeConfiguration(): Promise<NetworkInstallConfiguration> 
	{
		return await ApiService.installNodeConfiguration();
	}

	public async nodePassphrase(): Promise<NetworkPassphrase> 
	{
		return await ApiService.nodePassphrase();
	}

	public async setNodePassphrase(passphrase: string): Promise<boolean> 
	{
		return await ApiService.setPassphrase(passphrase);
	}

	public async startNode(): Promise<boolean> 
	{
		return await ApiService.startNode();
	}

	public async stopNode(): Promise<boolean> 
	{
		return await ApiService.stopNode();
	}

	public async restartNode(): Promise<boolean> 
	{
		return await ApiService.restartNode();
	}

	public async renewCertificate(): Promise<boolean> 
	{
		return await ApiService.renewCertificate();
	}

	public async updateSystem(target: 'system' | 'sentinel'): Promise<boolean> 
	{
		return await ApiService.updateSystem(target);
	}

	public async resetSystem(): Promise<boolean> 
	{
		return await ApiService.resetSystem();
	}

	public async rebootSystem(): Promise<boolean> 
	{
		return await ApiService.rebootSystem();
	}

	public async shutdownSystem(): Promise<boolean> 
	{
		return await ApiService.shutdownSystem();
	}

	public async createWallet(): Promise<string | null> 
	{
		return await ApiService.createWallet();
	}

	public async restoreWallet(mnemonic: string): Promise<boolean> 
	{
		return await ApiService.restoreWallet(mnemonic);
	}

	public async removeWallet(): Promise<boolean> 
	{
		return await ApiService.removeWallet();
	}

	public async checkPort(portType: 'node' | 'vpn'): Promise<string | null> 
	{
		return await ApiService.checkPort(portType);
	}
}

export default NetworkService.getInstance();
