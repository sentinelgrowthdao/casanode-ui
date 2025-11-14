<script lang="ts" setup>
import NetworkService from '@/services/NetworkService';
import { useNodeStore } from '@/stores/NodeStore';
import { AppGrid, AppGridCol, AppGridRow, IonButton, IonContent, IonItem, IonPage, IonText } from '@/ui';
import { refreshNodeAddress, refreshPublicAddress } from '@/utils/node';
import LoadingButton from '@components/LoadingButton.vue';
import { onMounted, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const errorMessage: Ref<string> = ref('');

/**
 * On mounted
 * @returns void
 */
onMounted(async () =>
{
	// Check if public address is already exist
	if(nodeStore.publicAddress.length > 0)
	{
		// Navigate to the next step
		router.replace({ name: 'Wizard8Fund' });
	}
});

/**
 * Send a request to create a wallet
 * @returns void
 */
const requestCreateWallet = async () =>
{
	// Create a new wallet
	const mnemonic: string|null = await NetworkService.createWallet();
	// If mnemonic is not null
	if(mnemonic !== null)
	{
		// Read public address
		const publicAddress: string|null = await refreshPublicAddress();
		// Read node address
		const nodeAddress: string|null = await refreshNodeAddress();
		// If all values are not null
		if(mnemonic !== null && publicAddress !== null && nodeAddress !== null)
		{
			// Set the mnemonic
			nodeStore.setMnemonic(mnemonic.split(' '));
			
			// Navigate to the next step
			router.push({ name: 'Wizard7Create' });
		}
		else
		{
			// Show an error message
			errorMessage.value = t('wizard.error-wallet-creation') as string;
		}
	}
	else
	{
		// Show an error message
		errorMessage.value = t('wizard.error-wallet-creation') as string;
	}
};

</script>
<template>
<ion-page>
	<ion-content :fullscreen="true">
		<div class="wizard">
			<div class="form">
				<h1>{{ $t('wizard.wallet-title') }}</h1>
				<p class="text">{{ $t('wizard.wallet-text') }}</p>
			</div>
			<div class="submit">
				<AppGrid>
					<AppGridRow v-if="errorMessage">
						<ion-item lines="none">
							<ion-text color="danger">{{ errorMessage }}</ion-text>
						</ion-item>
					</AppGridRow>
					<AppGridRow>
						<AppGridCol size="6">
							<loading-button :label="$t('wizard.button-create')" :callback="requestCreateWallet" />
						</AppGridCol>
						<AppGridCol size="6">
							<ion-button expand="block" :router-link="{ name: 'Wizard7Restore' }"
								router-direction="forward" fill="outline">
								{{ $t('wizard.button-restore') }}
							</ion-button>
						</AppGridCol>
					</AppGridRow>
				</AppGrid>
			</div>
		</div>
	</ion-content>
</ion-page>
</template>
<style lang="scss" scoped>
@import '@scss/wizard';
</style>
