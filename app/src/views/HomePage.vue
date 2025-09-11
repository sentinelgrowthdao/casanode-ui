<script lang="ts" setup>
import { type Ref, ref, onMounted } from 'vue';
import {
	IonPage, IonContent, IonButton, IonIcon,
	IonItem, IonInput, IonSpinner,
	modalController
} from '@ionic/vue';
import {
	closeOutline,
	bluetoothOutline,
	wifiOutline,
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Browser } from '@capacitor/browser';
import ConnectHelpModal from '@components/ConnectHelpModal.vue';
import { installScannerModule, scanClaimQr } from '@/utils/scan';
import { type ClaimPayload } from '@/utils/claim';
import { toggleKeepAwake } from '@/utils/awake';
import { useDeviceStore, type DeviceEntry } from '@stores/DeviceStore';
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';
import { CasaWifi } from '@/plugins/CasaWifi';
import { CasaHttp } from '@/plugins/CasaHttp';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();
// Device Store
const deviceStore = useDeviceStore();
// Device Ref
const deviceRef: Ref<DeviceEntry | null> = ref(null);
// Claim payload data
const deviceQrcodeData: Ref<ClaimPayload | null> = ref(null);

// Connecting message
const connectingMessage: Ref<string> = ref('');
// Error message
const errorMessage: Ref<string> = ref('');
// Passphrase form open
const passphraseFormOpen: Ref<boolean> = ref(false);
// Passphrase input value
const passphraseInputValue: Ref<string> = ref('');
// Passphrase loading
const passphraseLoading: Ref<boolean> = ref(false);
// Passphrase error message
const passphraseErrorMessage: Ref<string> = ref('');
// Find QR Code in progress
const findQRCodeLoader: Ref<boolean> = ref(false);
// Choose connection method open
const chooseConnectionMethodOpen: Ref<boolean> = ref(false);
// Connecting to the device is in progress
const isConnecting: Ref<boolean> = ref(false);

/**
 * On mounted, get the last device
 */
onMounted(() =>
{
	deviceRef.value = deviceStore.getLastDevice();
});

/**
 * Open the Sentinel website
 * @returns {Promise<void>}
 */
const openNodeLink = async () =>
{
	await Browser.open({ url: 'https://sentinel.co' });
};

/**
 * Open the news link
 * @returns {Promise<void>}
 */
const openNewsLink = async () =>
{
	await Browser.open({ url: 'https://www.dvpn.news' });
};

/**
 * Connect to the device
 */
const deviceConnection = async () =>
{
	// Check if the device is available
	if(deviceRef.value?.uuid)
	{
		// Keep the device awake
		await toggleKeepAwake(true);
		await NetworkService.connect({
			ip: deviceRef.value.apiIp ?? undefined,
			port: deviceRef.value.apiPort ?? undefined,
			token: deviceRef.value.apiToken ?? undefined,
		});
		await connectionToNode();
	}
};

/**
 * Remove the device from the store
 * @returns {void}
 */
const deviceRemove = () =>
{
	if(deviceRef.value)
	{
		deviceStore.removeDevice(deviceRef.value);
		deviceRef.value = deviceStore.getLastDevice();
	}
};

/**
 * Try to connect to the device using scanned QR code
 * @returns {Promise<void>}
 */
const tryConnection = async () =>
{
	connectingMessage.value = '';
	errorMessage.value = '';
	passphraseErrorMessage.value = '';

	await toggleKeepAwake(true);
	await installScannerModule();
	const qrcodeData: ClaimPayload | undefined = await scanClaimQr();

	if(qrcodeData)
	{
		deviceQrcodeData.value = qrcodeData;
		await connectLocalNetwork();
	}
	else
	{
		await toggleKeepAwake(false);
	}

};

/**
 * Connect to the device using TCP
 * @returns {Promise<void>}
 */
const connectLocalNetwork = async (): Promise<void> =>
{
	if (isConnecting.value)
		return;
	isConnecting.value = true;

	try
	{
		// Development fallback: connect directly to remote API if token is provided
		if (deviceQrcodeData.value?.authToken)
		{
			const connected = await NetworkService.connect({
				ip: deviceQrcodeData.value.host,
				port: deviceQrcodeData.value.apiPort || 8443,
				token: deviceQrcodeData.value.authToken,
			});

			if (connected)
			{
				chooseConnectionMethodOpen.value = false;
				deviceStore.addDevice({
					uuid: deviceQrcodeData.value.deviceId || 'dev-node',
					name: deviceQrcodeData.value.deviceId || 'dev-node',
					address: `${deviceQrcodeData.value.host}:${deviceQrcodeData.value.apiPort || 8443}`,
					connector: 'tcp',
					bleUuid: null,
					apiIp: deviceQrcodeData.value.host || null,
					apiPort: deviceQrcodeData.value.apiPort || 8443,
					apiToken: deviceQrcodeData.value.authToken || null,
				});
				deviceRef.value = deviceStore.getLastDevice();
				await connectionToNode();
				await toggleKeepAwake(false);
			}
			else
			{
				errorMessage.value = t('loading.error-message') as string;
			}
			return;
		}

		const join = await CasaWifi.join({
			ssid: deviceQrcodeData.value?.ap || '',
			passphrase: deviceQrcodeData.value?.pw,
			timeoutMs: 15000,
		});
		if(!join.connected)
		{
			errorMessage.value = t('loading.error-message') as string;
			return;
		}

		const health = await CasaHttp.get({
			url: `https://${deviceQrcodeData.value?.host}:8443/health`,
			fingerprintSha256: deviceQrcodeData.value?.fp,
		});
		if(health.status !== 200)
		{
			errorMessage.value = t('loading.error-message') as string;
			return;
		}

		const connected = await NetworkService.connect({
			ip: deviceQrcodeData.value?.host,
			port: 8443,
		});

		if(connected)
		{
			chooseConnectionMethodOpen.value = false;
			deviceStore.addDevice({
				uuid: deviceQrcodeData.value?.deviceId || '',
				name: deviceQrcodeData.value?.deviceId || '',
				address: deviceQrcodeData.value?.host || '',
				connector: 'tcp',
				bleUuid: null,
				apiIp: deviceQrcodeData.value?.host || null,
				apiPort: 8443,
				apiToken: null,
			});
			deviceRef.value = deviceStore.getLastDevice();
			await connectionToNode();
			await toggleKeepAwake(false);
		}
		else
		{
			errorMessage.value = t('loading.error-message') as string;
		}
	}
	finally
	{
		isConnecting.value = false;
	}
}

/**
 * Legacy Bluetooth connection (unsupported)
 * @returns {Promise<void>}
 */
const connectBluetooth = async (): Promise<void> =>
{
	errorMessage.value = t('loading.error-message') as string;
}

/**
 * Cancel the connection
 * @returns {Promise<void>}
 */
const cancelConnection = async (): Promise<void> =>
{
	// Disable the keep awake
	await toggleKeepAwake(false);
	// Clear the error message
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	// Close the passphrase form
	passphraseFormOpen.value = false;
};

/**
 * Open the help modal
 * @returns {Promise<void>}
*/
const openHelpModal = async () =>
{
	const modal = await modalController.create({
		component: ConnectHelpModal,
		componentProps: { ipPort: '192.168.50.1:8081' }
	});
	modal.present();
};

/**
 * Check if the app is loading
 * @returns {boolean}
 */
const isLoading = () =>
{
	return isConnecting.value
		|| connectingMessage.value.length > 0
		|| errorMessage.value.length > 0
		|| passphraseErrorMessage.value.length > 0;
}

/**
 * Process the connection to the device
 */
const connectionToNode = async () =>
{
	// Set the connecting message
	connectingMessage.value = t('loading.wait-connection') as string;
	// Clear the error message
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	
	// If the device is connected
	if(await NetworkService.isConnected())
	{
		try
		{
			// Get installation status
			const checkInstallation = await NetworkService.checkInstallation();

			// Parse the installation status
			const imageAvailable = checkInstallation.image;
			const nodeConfig = checkInstallation.nodeConfig;
			const vpnConfig = checkInstallation.vpnConfig;
			const certificateKey = checkInstallation.certificateKey;
			
			// If the image is unavailable
			if(!imageAvailable)
			{
				// Set the waiting message
				connectingMessage.value = t('loading.wait-docker') as string;
				// Request to install the image
				const installImage = await NetworkService.installDockerImage();
				// If an error occurred
				if(installImage !== 1)
				{
					// Set the connecting message
					errorMessage.value = t('loading.error-message-docker') as string;
					return;
				}
			}
			
			// If the node or VPN configuration does not exist
			if(!nodeConfig || !vpnConfig || !certificateKey)
			{
				// Set the waiting message
				connectingMessage.value = t('loading.wait-config') as string;
				// Request to install the node configuration
								const installConfigs = await NetworkService.installConfigs();
				// If an error occurred
				if(!installConfigs.nodeConfig || !installConfigs.vpnConfig || !installConfigs.certificate)
				{
					// Set the connecting message
					errorMessage.value = t('loading.error-message-config') as string;
					return;
				}
			}
			
			// Get the node passphrase status
			const nodePassphrase = await NetworkService.nodePassphrase();
			
			// If passphrase is needed
			if (nodePassphrase.required && !nodePassphrase.available)
			{
				errorMessage.value = '';
				// Open the passphrase form
				passphraseFormOpen.value = true;
			}
			else
			{
				// Finish the connection process
				await finishConnection();
			}
			
		}
		catch(e)
		{
			// Set the connecting message
			errorMessage.value = t('loading.error-message') as string;
			return;
		}
	}
	else
	{
		// Set the connecting message
		errorMessage.value = t('loading.error-message') as string;
	}
};

/**
 * Finish the connection process
 */
const finishConnection = async () =>
{
	// Load the node configuration
	await NodeService.loadNodeConfiguration();
	
	// Get installation status
	const checkInstallation = await NetworkService.checkInstallation();
	
	// Parse the installation status
	const imageAvailable = checkInstallation.image;
	const walletAvailable = checkInstallation.wallet;
	
	// Clear error messages
	connectingMessage.value = '';
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	
	// Disable the keep awake
	await toggleKeepAwake(false);
	
	// If the container does not exist or the wallet is not available
	if(!imageAvailable || !walletAvailable)
	{
		// Launch the wizard
		router.replace({ name: 'Wizard1Welcome' });
	}
	else
	{
		// Redirect to the dashboard
		router.replace({ name: 'NodeDashboard' });
	}
};

/**
 * Submit the passphrase
 */
const submitPassphrase = async () => 
{
	// Clear the error message
	passphraseErrorMessage.value = '';
	// Show loading
	passphraseLoading.value = true;
	// Get the passphrase
	const passphrase = passphraseInputValue.value.trim();
	
	// Reconnect to the device
	const reconnect = await NetworkService.reconnect();
	if(!reconnect)
	{
		// Hide the loading
		passphraseLoading.value = false;
		// Set the error message
		passphraseErrorMessage.value = t('loading.passphrase-error') as string;
		return;
	}
	
	// Send the passphrase to the device
	const passphraseValid = await NetworkService.setNodePassphrase(passphrase);
	
	// Send the passphrase to the device
	if(passphraseValid)
	{
		// Hide the loading
		passphraseLoading.value = false;
		// Close the passphrase form
		passphraseFormOpen.value = false;
		// Finish the connection process
		await finishConnection();
	}
	else
	{
		// Hide the loading
		passphraseLoading.value = false;
		// Set the error message
		passphraseErrorMessage.value = t('loading.passphrase-error') as string;
	}
};

</script>
<template>
	<ion-page>
		<ion-content class="homepage" :fullscreen="true">
			<div class="content">
				<div class="header">
					<h1>{{ $t('app.name') }}</h1>
					<p class="logo">
						<img src="@assets/images/casanode-logo.png" alt="Logo" />
					</p>
				</div>
				<div v-if="!isLoading() && chooseConnectionMethodOpen === false" class="welcome">
					<h2>{{ $t(deviceRef ? 'welcome.start-title-alt' : 'welcome.start-title') }}</h2>
					<div v-if="deviceRef" class="start device">
						<p class="close">
							<ion-button size="small" fill="clear" @click="deviceRemove">
								<ion-icon :icon="closeOutline" />
							</ion-button>
						</p>
						<p class="name">{{ deviceRef.name }}</p>
						<p class="address">{{ deviceRef.address }}</p>
						<p class="button">
							<ion-button expand="block" size="small" @click="deviceConnection">
								{{ $t('welcome.start-button-alt') }}
							</ion-button>
						</p>
						<p class="scan">
							<ion-button size="small" fill="clear" @click="tryConnection">
								{{ $t('welcome.start-scan-button') }}
							</ion-button>
						</p>
					</div>
					<div v-else class="start">
						<p class="message">{{ $t('welcome.start-text') }}</p>
						<p class="button">
							<ion-button @click="tryConnection">
								{{ $t('welcome.start-button') }}
							</ion-button>
						</p>
						<p class="help">
							<ion-button size="small" fill="clear" :disabled="findQRCodeLoader" @click="openHelpModal">
								<ion-spinner name="crescent" v-if="findQRCodeLoader" />
								{{ $t('welcome.start-help-button') }}
							</ion-button>
						</p>
					</div>
				</div>
				<div v-else-if="!isLoading() && chooseConnectionMethodOpen === true" class="welcome methods">
					<h2 v-html="t('welcome.method-title')" />
					<ion-grid>
						<ion-row>
							<ion-col size="6">
								<ion-button expand="block" color="none" @click="connectBluetooth" :disabled="isConnecting">
									<div class="content">
										<div class="button">
											<ion-icon :icon="bluetoothOutline" />
											<p class="name">{{ $t('welcome.method-ble-name') }}</p>
										</div>
										<p class="desc">{{ $t('welcome.method-ble-desc') }}</p>
									</div>
								</ion-button>
							</ion-col>
							<ion-col size="6">
								<ion-button expand="block" color="none" @click="connectLocalNetwork" :disabled="isConnecting">
									<div class="content">
											<div class="button">
											<ion-icon :icon="wifiOutline" />
											<p class="name">{{ $t('welcome.method-lan-name') }}</p>
										</div>
										<p class="desc">{{ $t('welcome.method-lan-desc') }}</p>
									</div>
								</ion-button>
							</ion-col>
						</ion-row>
					</ion-grid>
				</div>
				<div v-else class="loading">
					<div v-if="errorMessage.length === 0 && passphraseFormOpen === false && chooseConnectionMethodOpen === false" class="connecting">
						<p class="spinner"><ion-spinner name="crescent" /></p>
						<p class="message">{{ connectingMessage }}</p>
					</div>
					<div v-else-if="errorMessage.length === 0 && passphraseFormOpen === true && chooseConnectionMethodOpen === false" class="passphrase">
						<p v-if="passphraseErrorMessage.length > 0" class="error">{{ passphraseErrorMessage }}</p>
						<p v-else class="message">{{ $t('loading.passphrase-message') }}</p>
						<ion-item>
							<ion-input v-model="passphraseInputValue" type="password" :placeholder="t('loading.passphrase-placeholder')"></ion-input>
						</ion-item>
						<p class="button">
							<ion-button @click="submitPassphrase" :disabled="passphraseLoading">
								<ion-spinner name="crescent" v-if="passphraseLoading" />
								{{ $t('loading.passphrase-button') }}
							</ion-button>
						</p>
					</div>
					<div v-else class="error">
						<p class="message">{{ errorMessage }}</p>
						<p class="button"><ion-button @click="tryConnection">{{ $t('loading.retry') }}</ion-button></p>
					</div>
				</div>
				<div v-if="deviceRef" class="footer">
					<p class="title">{{ $t('welcome.news-title') }}</p>
					<p class="message">{{ $t('welcome.news-text') }}</p>
					<p class="button">
						<ion-button size="small" fill="clear" @click="openNewsLink">
							{{ $t('welcome.news-button') }}
						</ion-button>
					</p>
				</div>
				<div v-else-if="chooseConnectionMethodOpen === true" class="footer">
					<p class="button">
						<ion-button size="small" fill="clear" @click="cancelConnection">
							{{ $t('welcome.method-cancel') }}
						</ion-button>
					</p>
				</div>
				<div v-else class="footer">
					<p class="title">{{ $t('welcome.get-node-title') }}</p>
					<p class="message">{{ $t('welcome.get-node-text') }}</p>
					<p class="button">
						<ion-button size="small" fill="clear" @click="openNodeLink">
							{{ $t('welcome.get-node-button') }}
						</ion-button>
					</p>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/homepage.scss";
</style>
