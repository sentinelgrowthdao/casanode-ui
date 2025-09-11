import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'co.sentinel.casanode',
	appName: 'Casanode',
	webDir: 'dist',
	plugins:
	{
		CapacitorMLKitBarcodeScanning: {
			cameraPermissionText: "We need camera access to scan QR codes."
		}
	}
};

export default config;
