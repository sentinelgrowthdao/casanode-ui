<script lang="ts" setup>
import { ref } from 'vue';
import { IonPage, IonContent, IonButton, IonSpinner, IonItem, IonInput } from '@/ui';
import { useRouter } from 'vue-router';
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';
import { useAuthStore } from '@/stores/AuthStore';
import { useConnectionStore } from '@/stores/ConnectionStore';

const router = useRouter();
const authStore = useAuthStore();

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
	let vpnConfig = !!install.vpnConfig;
	let certificateKey = !!install.certificateKey;

	// Install Docker image if missing
	if (!imageAvailable)
	{
		connectingMessage.value = (window as any).$t?.('loading.wait-docker') || 'Preparing environment…';
		const ok = await NetworkService.installDockerImage();
		if (!ok)
		{
			error.value = (window as any).$t?.('loading.error-message-docker') || 'Failed to install Docker image.';
			return;
		}
		imageAvailable = true;
	}
	
	// Install node/VPN/certificate configs if missing
	if (!nodeConfig || !vpnConfig || !certificateKey)
	{
		connectingMessage.value = (window as any).$t?.('loading.wait-config') || 'Installing configuration…';
		const cfg = await NetworkService.installNodeConfiguration();
		if (!cfg?.nodeConfig || !cfg?.vpnConfig || !cfg?.certificate)
		{
			error.value = (window as any).$t?.('loading.error-message-config') || 'Failed to install configuration.';
			return;
		}
		nodeConfig = true;
		vpnConfig = true;
		certificateKey = true;
	}

	// If passphrase is required, open form (pause keep-awake while typing)
	connectingMessage.value = (window as any).$t?.('loading.wait-connection') || 'Connecting to node…';
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
 * 2. Else use ephemeral ConnectionStore values (from /connect URL) and perform login.
 * 3. Persist endpoint after successful authentication for future automatic reuse.
 */
const start = async () =>
{
	// Prevent double click
	if (isConnecting.value) return;

	error.value = '';
	connectingMessage.value = '';
	loading.value = true;
	isConnecting.value = true;

	try
	{
		const connectionStore = useConnectionStore();

		// Determine endpoint priority: authStore first (if token & endpoint), else ephemeral
		let ip: string | undefined = undefined;
		let port: number | undefined = undefined;
		let useExistingJwt = false;
		const tokenPreset = connectionStore.preSharedToken || undefined; // optional pre-shared login token

		if (authStore.token && authStore.lastIp && authStore.lastPort)
		{
			ip = authStore.lastIp;
			port = authStore.lastPort;
			useExistingJwt = true;
		}
		else
		{
			ip = connectionStore.ip || authStore.lastIp || undefined;
			port = connectionStore.port || authStore.lastPort || undefined;
		}

		console.log(`Connecting to ${ip}:${port} (existing JWT: ${useExistingJwt})`);

		// Connect with resolved endpoint
		const connected = await NetworkService.connect({ ip, port });
		if (!connected)
		{
			throw new Error("Impossible de se connecter à l'API.");
		}

		// If no valid JWT yet, perform login (may use pre-shared token)
		if (!useExistingJwt)
		{
			const res = await NetworkService.login(tokenPreset);
			if (!res || !res.token)
			{
				throw new Error('Authentification échouée.');
			}
			authStore.setTokens(res.token, res.refreshToken, res.expiresAt ?? null);
			NetworkService.setAuthToken(res.token);
		}
		else
		{
			// Ensure ApiService has the token loaded (e.g. after reload)
			NetworkService.setAuthToken(authStore.token);
		}

		// Persist endpoint (always) so we can re-use it next time
		authStore.setLastEndpoint(ip || null, port || null);

		await proceed();
	}
	catch (e: any)
	{
		error.value = e?.message || 'Une erreur est survenue.';
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
			passphraseErrorMessage.value = 'La passphrase doit contenir au moins 8 caractères.';
			return;
		}

		// Reconnect before sending passphrase (matches original behavior)
		const reconnected = await (NetworkService.reconnect?.() ?? Promise.resolve(true));
		if (reconnected === false)
		{
			passphraseErrorMessage.value = (window as any).$t?.('loading.passphrase-error') || 'Passphrase validation failed.';
			return;
		}

		const ok = await NetworkService.setNodePassphrase(value);
		if (!ok)
		{
			passphraseErrorMessage.value = (window as any).$t?.('loading.passphrase-error') || 'Failed to send passphrase.';
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
							{{ (loading || isConnecting) ? ($t('loading.wait-connection') as string) : ($t('welcome.start-button') as string) }}
						</ion-button>
					</p>
					<p v-if="connectingMessage" class="help">{{ connectingMessage }}</p>
					<p v-if="error" class="help" style="color:#f66;">{{ error }}</p>
				</div>
			</div>

			<!-- Passphrase form -->
			<div
				v-else
				class="passphrase"
				style="display:flex;flex-direction:column;gap:.75rem;align-items:stretch;max-width:20rem;margin:1rem auto 0;">
				<p class="message">{{ $t('loading.passphrase-message') }}</p>
				<ion-item>
					<ion-input
						v-model="passphraseInputValue"
						type="password"
						:placeholder="$t('loading.passphrase-placeholder')"/>
				</ion-item>
				<p class="button">
					<ion-button :disabled="passphraseLoading" @click="submitPassphrase">
						<ion-spinner v-if="passphraseLoading" name="crescent" />
						{{ $t('loading.passphrase-button') }}
					</ion-button>
				</p>
				<p v-if="passphraseErrorMessage" class="error" style="color:#f66;">{{ passphraseErrorMessage }}</p>
			</div>
		</div>
	</ion-content>
</ion-page>
</template>

<style lang="scss" scoped>
@import "@scss/homepage.scss";
</style>
