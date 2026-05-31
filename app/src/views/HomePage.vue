<script lang="ts" setup>
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';
import { useAuthStore } from '@/stores/AuthStore';
import { IonButton, IonContent, IonItem, IonPage, IonSpinner, UiInputField } from '@/ui';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const { t, te } = useI18n();

const invalidReason = computed(() => authStore.invalidReason);
const hasStartupContext = computed(() => Boolean(authStore.token && authStore.lastIp && authStore.lastPort));
const startupIssueKey = computed(() => invalidReason.value || '');
const missingContext = computed(() => !invalidReason.value && !hasStartupContext.value);

const loading = ref(false);
const isConnecting = ref(false);
const connectingMessage = ref('');
const error = ref('');

const passphraseFormOpen = ref(false);
const passphraseInputValue = ref('');
const passphraseLoading = ref(false);
const passphraseErrorMessage = ref('');

const resolveText = (key: string): string =>
{
	return te(key) ? t(key) : key;
};

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
		connectingMessage.value = t('loading.wait-docker');
		const ok = await NetworkService.installDockerImage();
		if (!ok) 
		{
			error.value = t('loading.error-message-docker');
			return;
		}
		imageAvailable = true;
	}
	
	// Install node/VPN/certificate configs if missing
	if (!nodeConfig || !certificateKey) 
	{
		connectingMessage.value = t('loading.wait-config');
		const cfg = await NetworkService.installNodeConfiguration();
		if (!cfg?.nodeConfig || !cfg?.certificate) 
		{
			error.value = t('loading.error-message-config');
			return;
		}
		nodeConfig = true;
		certificateKey = true;
	}

	// If passphrase is required, open form (pause keep-awake while typing)
	connectingMessage.value = t('loading.wait-connection');
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
 * 1. If we already have a JWT + stored endpoint (authStore.lastIp/lastPort) → reuse them.
 * 2. If the context is missing, show a clear UI state and stop.
 * 3. Persist endpoint after a successful reconnect.
 */
const start = async () =>
{
	// Prevent double click
	if (isConnecting.value) return;

	if (startupIssueKey.value)
	{
		error.value = resolveText(startupIssueKey.value);
		return;
	}

	error.value = '';
	connectingMessage.value = '';
	loading.value = true;
	isConnecting.value = true;

	try
	{
		const ip = authStore.lastIp;
		const port = authStore.lastPort;
		if (!ip || !port)
		{
			error.value = resolveText('homepage.no-context');
			return;
		}

		const connected = await NetworkService.connect({ ip, port });
		if (!connected)
		{
			error.value = resolveText('homepage.unable-connect-api');
			return;
		}

		NetworkService.setAuthToken(authStore.token);
		authStore.setLastEndpoint(ip || null, port || null);
		await proceed();
	}
	catch (e: unknown)
	{
		error.value = e instanceof Error ? e.message : resolveText('homepage.error-generic');
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
			passphraseErrorMessage.value = t('homepage.error-passphrase-length');
			return;
		}

		// Reconnect before sending passphrase (matches original behavior)
		const reconnected = await (NetworkService.reconnect?.() ?? Promise.resolve(true));
		if (reconnected === false)
		{
			passphraseErrorMessage.value = t('loading.passphrase-error');
			return;
		}

		const ok = await NetworkService.setNodePassphrase(value);
		if (!ok)
		{
			passphraseErrorMessage.value = t('loading.passphrase-error');
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
				<div v-if="startupIssueKey" class="invalid-banner" role="alert" aria-live="polite">
					<p class="title">
						{{ $t('homepage.invalid-session') }}
					</p>
					<p class="text">
						{{ resolveText(startupIssueKey) }}
					</p>
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
						<p v-if="missingContext" class="help">
							{{ $t('homepage.no-context-help') }}
						</p>
						<p class="button">
							<ion-button :disabled="loading || isConnecting || missingContext" @click="start">
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
						<UiInputField
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
@use '@scss/homepage' as *;

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

.invalid-banner .title {
	color: #fff;
	font-size: 0.95rem;
	font-weight: 700;
	margin: 0;
}

.invalid-banner .text {
	color: #f99;
	font-size: 0.85rem;
	margin: 0;
}

</style>
