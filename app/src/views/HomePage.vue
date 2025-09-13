<script lang="ts" setup>
import { ref } from 'vue';
import { IonPage, IonContent, IonButton, IonSpinner, IonItem, IonInput } from '@/ui';
import { useRouter } from 'vue-router';
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';
import { useAuthStore } from '@/stores/AuthStore';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');
const passphraseFormOpen = ref(false);
const passphraseInputValue = ref('');
const passphraseLoading = ref(false);
const passphraseErrorMessage = ref('');

const proceed = async () => 
{
	// Verify installation status
	const install = await NetworkService.checkInstallation();
	const imageAvailable = !!install.image;
	const nodeConfig = !!install.nodeConfig;
	const vpnConfig = !!install.vpnConfig;
	const certificateKey = !!install.certificateKey;
	if (!imageAvailable || !nodeConfig || !vpnConfig || !certificateKey)
	{
		return router.replace({ name: 'Wizard1Welcome' });
	}

	// Check passphrase requirement
	const pass = await NetworkService.nodePassphrase();
	if (pass.required && !pass.available)
	{
		passphraseFormOpen.value = true;
		return; // wait user input
	}

	// Load config and go to dashboard or wallet flow
	await NodeService.loadNodeConfiguration();
	if (!install.wallet)
		return router.replace({ name: 'Wizard7Wallet' });
	return router.replace({ name: 'NodeDashboard' });
};

const start = async () =>
{
	error.value = '';
	loading.value = true;
	try
	{
		// Initialize API base URL (from .env if no ip/port provided)
		const connected = await NetworkService.connect({});
		if (!connected) throw new Error("Impossible de se connecter à l'API.");

		// Authenticate and store JWT
		const res = await NetworkService.login();
		if (!res || !res.token) throw new Error("Authentification échouée");
		authStore.setTokens(res.token, res.refreshToken);
		NetworkService.setAuthToken(res.token);

		await proceed();
	}
	catch (e: any)
	{
		error.value = e?.message || 'Une erreur est survenue.';
	}
	finally
	{
		loading.value = false;
	}
};

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
		const ok = await NetworkService.setNodePassphrase(value);
		if (!ok)
		{
			passphraseErrorMessage.value = 'Échec de l’envoi de la passphrase.';
			return;
		}
		passphraseFormOpen.value = false;
		loading.value = true;
		await proceed();
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
			<div class="welcome" v-if="!passphraseFormOpen">
				<h2>{{ $t('welcome.start-title') }}</h2>
				<div class="start">
					<p class="message">{{ $t('welcome.start-text') }}</p>
					<p class="button">
						<ion-button :disabled="loading" @click="start">
							<ion-spinner v-if="loading" name="crescent" />
							{{ loading ? 'Connexion…' : $t('welcome.start-button') }}
						</ion-button>
					</p>
					<p v-if="error" class="help" style="color:#f66;">{{ error }}</p>
				</div>
			</div>

			<div v-else class="passphrase" style="display:flex;flex-direction:column;gap:.75rem;align-items:stretch;max-width:20rem;margin:1rem auto 0;">
				<p class="message">{{ $t('loading.passphrase-message') }}</p>
				<ion-item>
					<ion-input v-model="passphraseInputValue" type="password" :placeholder="$t('loading.passphrase-placeholder')" />
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
