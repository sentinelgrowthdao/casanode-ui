import { parseClaimUrl, type ClaimPayload } from '@/utils/claim';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

/**
 * Install Google Barcode Scanner module
 * @returns {Promise<void>}
 */
export async function installScannerModule(): Promise<void>
{
	try
	{
		await BarcodeScanner.requestPermissions();
		const module = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
		if(!module.available)
		{
			console.log('[SCANNER] Google Barcode Scanner module is not available');
			await BarcodeScanner.installGoogleBarcodeScannerModule();
			console.log('[SCANNER] Google Barcode Scanner module installed');
		}
		else
			console.log('[SCANNER] Google Barcode Scanner module is available');
	}
	catch (error)
	{
		console.error('[SCANNER] Failed to check or install Google Barcode Scanner module', error);
	}
}

/**
 * Scan a QR code containing a casanode claim URL
 * @returns {Promise<ClaimPayload|undefined>}
 */
export async function scanClaimQr(): Promise<ClaimPayload | undefined>
{
	try
	{
		const result = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
		if(result && result.barcodes.length > 0)
		{
			const raw = result.barcodes[0].rawValue;
			if(raw)
				return parseClaimUrl(raw);
		}
		else
		{
			console.error('Scan failed or no content found');
			if(process.env.NODE_ENV === 'development')
			{
				try
				{
					// @ts-expect-error dynamically import JSON alias
					const qrData = await import('@qrcode.json');
					const payload = qrData?.default;
					if (typeof payload === 'string')
						return parseClaimUrl(payload);
					if (payload && typeof payload === 'object')
					{
						if (typeof payload.raw === 'string')
							return parseClaimUrl(payload.raw);
						if (typeof payload.ip === 'string' && (typeof payload.apiPort === 'string' || typeof payload.apiPort === 'number'))
						{
							const apiPortNum = typeof payload.apiPort === 'string' ? parseInt(payload.apiPort, 10) : payload.apiPort;
							return {
								deviceId: payload.device || 'dev-node',
								claimCode: '',
								ap: '',
								pw: '',
								host: payload.ip,
								fp: undefined,
								authToken: typeof payload.authToken === 'string' ? payload.authToken : undefined,
								apiPort: Number.isFinite(apiPortNum) ? apiPortNum : 8443,
							} as ClaimPayload;
						}
					}
				}
				catch(fileError)
				{
					console.error('The qrcode.json file is not available or could not be loaded');
				}
			}
		}
	}
	catch (error: any)
	{
		if(typeof(error?.code) !== 'undefined' && error?.code === 'UNAVAILABLE')
		{
			if(process.env.NODE_ENV === 'development')
			{
				try
				{
					// @ts-expect-error dynamically import JSON alias
					const qrData = await import('@qrcode.json');
					const payload = qrData?.default;
					// Support two dev formats:
					// 1) A string or { raw } containing the claim URL
					// 2) An object with { ip, apiPort, authToken }
					if (typeof payload === 'string')
					{
						return parseClaimUrl(payload);
					}
					else if (payload && typeof payload === 'object')
					{
						if (typeof payload.raw === 'string')
						{
							return parseClaimUrl(payload.raw);
						}
						// Object with remote API details
						if (typeof payload.ip === 'string' && (typeof payload.apiPort === 'string' || typeof payload.apiPort === 'number'))
						{
							const apiPortNum = typeof payload.apiPort === 'string' ? parseInt(payload.apiPort, 10) : payload.apiPort;
							return {
								deviceId: payload.device || 'dev-node',
								claimCode: '',
								ap: '',
								pw: '',
								host: payload.ip,
								fp: undefined,
								authToken: typeof payload.authToken === 'string' ? payload.authToken : undefined,
								apiPort: Number.isFinite(apiPortNum) ? apiPortNum : 8443,
							} as ClaimPayload;
						}
					}
					console.error('The qrcode.json file format is not recognized');
				}
				catch(fileError)
				{
					console.error('The qrcode.json file is not available or could not be loaded');
				}
			}
			else
			{
				console.error('Barcode scanner is unavailable');
			}
		}
		else
		{
			console.error('An unexpected error occurred:', error);
		}
	}

	return undefined;
}
