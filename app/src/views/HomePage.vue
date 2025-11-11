<script lang="ts" setup>
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';
import { useAuthStore } from '@/stores/AuthStore';
import { IonButton, IonContent, IonInput, IonItem, IonPage, IonSpinner } from '@/ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const invalidReason = computed(() => authStore.invalidReason);

const loading = ref(false);
const isConnecting = ref(false);
const connectingMessage = ref('');
const error = ref('');

const passphraseFormOpen = ref(false);
const passphraseInputValue = ref('');
const passphraseLoading = ref(false);
const passphraseErrorMessage = ref('');

/**
 * Final step: load node config and route user
 */
const finishConnection = async (): Promise<void> =>
{
	// Load node configuration (hydrates stores if needed)
	await NodeService.loadNodeConfiguration();

	// Re-check installation to decide next screen
	const install = await NetworkService.checkInstallation();
	const imageAvailable = !!install.image;
	const walletAvailable = !!install.wallet;

	// Clear state
	connectingMessage.value = '';
	error.value = '';
	passphraseErrorMessage.value = '';

	// If container or wallet missing → go to wizard
	if (!imageAvailable || !walletAvailable)
	{
		router.replace({ name: 'Wizard1Welcome' });
		return;
	}

	// Otherwise go to dashboard
	router.replace({ name: 'NodeDashboard' });
};

/**
 * Ensure Docker image & configs exist, then handle passphrase if required
 */
const proceed = async () =>
{
	// Initial installation check
	connectingMessage.value = '';
	let install = await NetworkService.checkInstallation();

	let imageAvailable = !!install.image;
	let nodeConfig = !!install.nodeConfig;
	let certificateKey = !!install.certificateKey;

	// Install Docker image if missing
	if (!imageAvailable)
	{
		connectingMessage.value =
			(window as any).$t?.('loading.wait-docker') || 'Preparing environment…';
		const ok = await NetworkService.installDockerImage();
		if (!ok) 
		{
			error.value =
				(window as any).$t?.('loading.error-message-docker') || 'Failed to install Docker image.';
			return;
		}
		imageAvailable = true;
	}
	
	// Install node/VPN/certificate configs if missing
	if (!nodeConfig || !certificateKey) 
	{
		connectingMessage.value =
			(window as any).$t?.('loading.wait-config') || 'Installing configuration…';
		const cfg = await NetworkService.installNodeConfiguration();
		if (!cfg?.nodeConfig || !cfg?.certificate) 
		{
			error.value =
				(window as any).$t?.('loading.error-message-config') || 'Failed to install configuration.';
			return;
		}
		nodeConfig = true;
		certificateKey = true;
	}

	// If passphrase is required, open form (pause keep-awake while typing)
	connectingMessage.value =
		(window as any).$t?.('loading.wait-connection') || 'Connecting to node…';
	install = await NetworkService.checkInstallation(); // refresh state
	const pass = await NetworkService.nodePassphrase();
	if (pass.required && !pass.available) 
	{
		error.value = '';
		passphraseFormOpen.value = true;
		connectingMessage.value = '';
		return;
	}

	// All good → finalize
	await finishConnection();
};

/**
 * Start sequence logic (priority order):
 * 1. If we already have a JWT + stored endpoint (authStore.lastIp/lastPort) → reuse them (skip login).
 * 2. Else we cannot proceed: user must go to /connect to scan or input params (ConnectionStore removed).
 * 3. Persist endpoint after successful authentication for future automatic reuse.
 */
const start = async () =>
{
	// Prevent double click
	if (isConnecting.value) return;

	// If session invalid, force user to /connect
	if (authStore.invalidReason)
	{
		error.value = authStore.invalidReason + ' Please go to the connection page.';
		return;
	}

	error.value = '';
	connectingMessage.value = '';
	loading.value = true;
	isConnecting.value = true;

	try
	{
		let ip: string | undefined;
		let port: number | undefined;
		let useExistingJwt = false;

		if (authStore.token && authStore.lastIp && authStore.lastPort)
		{
			ip = authStore.lastIp;
			port = authStore.lastPort;
			useExistingJwt = true;
		}
		else
		{
			throw new Error(
				(window as any).$t?.('homepage.no-context') ||
					"No connection context. Please go to /connect to scan the node's QR code."
			);
		}

		const connected = await NetworkService.connect({ ip, port });
		if (!connected)
		{
			throw new Error(
				(window as any).$t?.('homepage.unable-connect-api') || 'Unable to connect to the API.'
			);
		}

		if (!useExistingJwt)
		{
			throw new Error(
				(window as any).$t?.('homepage.missing-jwt') || 'Missing JWT. Please rescan the QR code.'
			);
		}

		NetworkService.setAuthToken(authStore.token);
		authStore.setLastEndpoint(ip || null, port || null);
		await proceed();
	}
	catch (e: any)
	{
		error.value =
			e?.message || (window as any).$t?.('homepage.error-generic') || 'An error occurred.';
	}
	finally
	{
		loading.value = false;
		isConnecting.value = false;
	}
};

/**
 * Submit passphrase with reconnect (parity with legacy flow)
 */
const submitPassphrase = async () =>
{
	passphraseErrorMessage.value = '';
	passphraseLoading.value = true;

	try
	{
		const value = (passphraseInputValue.value || '').trim();
		if (!value || value.length < 8)
		{
			passphraseErrorMessage.value =
				(window as any).$t?.('homepage.error-passphrase-length') ||
				'Passphrase must contain at least 8 characters.';
			return;
		}

		// Reconnect before sending passphrase (matches original behavior)
		const reconnected = await (NetworkService.reconnect?.() ?? Promise.resolve(true));
		if (reconnected === false)
		{
			passphraseErrorMessage.value =
				(window as any).$t?.('loading.passphrase-error') || 'Passphrase validation failed.';
			return;
		}

		const ok = await NetworkService.setNodePassphrase(value);
		if (!ok)
		{
			passphraseErrorMessage.value =
				(window as any).$t?.('loading.passphrase-error') || 'Failed to send passphrase.';
			return;
		}

		passphraseFormOpen.value = false;
		loading.value = true;

		// Resume automated sequence (will disable keep-awake)
		await finishConnection();
	}
	finally
	{
		passphraseLoading.value = false;
		loading.value = false;
	}
};
</script>

<template>
	<ion-page>
		<ion-content class="homepage" :fullscreen="true">
			<div class="content">
				<!-- Invalid session banner -->
				<div v-if="invalidReason" class="invalid-banner">
					<p class="text">
						<!-- Try to translate the reason if it's a key, else display raw -->
						{{ $te(`errors.${invalidReason}`) ? $t(`errors.${invalidReason}`) : invalidReason }}
					</p>
					<div class="actions">
						<ion-button
							size="small"
							fill="outline"
							@click="
								() => {
									authStore.clear();
									router.replace({ name: 'ConnectLink' });
								}
							"
						>
							{{ $t('homepage.invalid-banner-reset') }}
						</ion-button>
						<ion-button
							size="small"
							color="primary"
							@click="() => router.replace({ name: 'ConnectLink' })"
						>
							{{ $t('homepage.invalid-banner-go-connect') }}
						</ion-button>
					</div>
				</div>
				<div class="header">
					<h1>{{ $t('app.name') }}</h1>
					<p class="logo">
						<img src="@assets/images/casanode-logo.png" alt="Logo" />
					</p>
				</div>

				<!-- Main screen -->
				<div class="welcome" v-if="!passphraseFormOpen">
					<h2>{{ $t('welcome.start-title') }}</h2>
					<div class="start">
						<p class="message">{{ $t('welcome.start-text') }}</p>
						<p class="button">
							<ion-button :disabled="loading || isConnecting" @click="start">
								<ion-spinner v-if="loading || isConnecting" name="crescent" />
								{{
									loading || isConnecting
										? ($t('loading.wait-connection') as string)
										: ($t('welcome.start-button') as string)
								}}
							</ion-button>
						</p>
						<p v-if="connectingMessage" class="help">{{ connectingMessage }}</p>
						<p v-if="error" class="help" style="color: #f66">{{ error }}</p>
					</div>
				</div>

				<!-- Passphrase form -->
				<div
					v-else
					class="passphrase"
					style="
						display: flex;
						flex-direction: column;
						gap: 0.75rem;
						align-items: stretch;
						max-width: 20rem;
						margin: 1rem auto 0;
					"
				>
					<p class="message">{{ $t('loading.passphrase-message') }}</p>
					<ion-item>
						<ion-input
							v-model="passphraseInputValue"
							type="password"
							:placeholder="$t('loading.passphrase-placeholder')"
						/>
					</ion-item>
					<p class="button">
						<ion-button :disabled="passphraseLoading" @click="submitPassphrase">
							<ion-spinner v-if="passphraseLoading" name="crescent" />
							{{ $t('loading.passphrase-button') }}
						</ion-button>
					</p>
					<p v-if="passphraseErrorMessage" class="error" style="color: #f66">
						{{ passphraseErrorMessage }}
					</p>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>

<style lang="scss" scoped>
@import '@scss/homepage';

.invalid-banner {
	background: #331;
	border: 1px solid #a55;
	padding: 0.75rem 1rem;
	border-radius: 0.5rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 1rem;
}

.invalid-banner .text {
	color: #f99;
	font-size: 0.85rem;
	margin: 0;
}

.invalid-banner .actions {
	display: flex;
	gap: 0.5rem;
}
</style>
