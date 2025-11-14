<script lang="ts" setup>
import AppToolbar from '@/components/AppToolbar.vue';
import NetworkService from '@/services/NetworkService';
import { AppGrid, AppGridCol, AppGridRow, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonPage } from '@/ui';
import { useDeviceStore, type DeviceEntry } from '@stores/DeviceStore';
import { useNodeStore } from '@stores/NodeStore';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

// Node Store
const nodeStore = useNodeStore();
// Device Store
const deviceStore = useDeviceStore();

/**
 * On mounted, get the last device
 */
onMounted(() =>
{
	// Check if the node is connected
	if(NetworkService.isConnected())
	{
		// Get the last device
		const deviceUuid = NetworkService.getDeviceUuid();
		if(deviceUuid)
		{
			// Get the API infos
			const apiInfos = NetworkService.getApiInfos();
			// Add the device to the store
			deviceStore.addDevice({
				uuid: deviceUuid,
				connector: NetworkService.getConnector(),
				name: nodeStore.moniker,
				address: nodeStore.nodeIp,
				bleUuid: NetworkService.getDeviceUuid(),
				apiIp: apiInfos?.ip || null,
				apiPort: apiInfos?.port || null,
				apiToken: apiInfos?.token || null,
			} as DeviceEntry);
		}
	}
});

/**
 * Define the node status text
 * @returns string
 */
const nodeStatus = computed(() =>
{
	return t(`dashboard.status-${nodeStore.status}`);
});

/**
 * Disconnect the node
 * @returns Promise<void>
 */
const nodeDisconnect = async() =>
{
	// Disconnect the node
	await NetworkService.disconnect();
	// Redirect to the home page
	router.replace({ name: 'Home' });
};

</script>
<template>
<ion-page>
	<ion-header>
		<app-toolbar />
	</ion-header>
	<ion-content>
		<div class="dashboard">
			<ion-card class="container bg-blue">
				<ion-card-content>
					<AppGrid>
						<AppGridRow>
							<AppGridCol class="item column">
								<p class="label">{{ $t('dashboard.status-title') }}</p>
								<p class="value">{{ nodeStatus }}</p>
							</AppGridCol>
							<AppGridCol class="item column right">
								<p class="label">{{ $t('dashboard.status-users') }}</p>
								<p class="value">{{ nodeStore.onlineUsers }}</p>
							</AppGridCol>
						</AppGridRow>
					</AppGrid>
				</ion-card-content>
			</ion-card>
				
			<ion-card class="container">
				<ion-card-header>
					<ion-card-title>{{ $t('dashboard.node-title') }}</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<p class="item">
						<strong>{{ $t('dashboard.node-address') }}</strong>{{ nodeStore.nodeIp }}
					</p>
					<p class="item">
						<strong>{{ $t('dashboard.node-location') }}</strong>{{ nodeStore.nodeLocation }}
					</p>
					<p class="item">
						<strong>{{ $t('dashboard.node-vpn') }}</strong>{{ nodeStore.vpnType }}
					</p>
					<p class="item">
						<strong>{{ $t('dashboard.node-port') }}</strong>{{ nodeStore.nodePort }}
					</p>
					<p class="item">
						<strong>{{ $t(`dashboard.node-${nodeStore.vpnType}-port`) }}</strong>{{ nodeStore.vpnPort }}
					</p>
					<p class="item">
						<strong>{{ $t('dashboard.node-ssl-expiry') }}</strong>{{ nodeStore.certExpiry }}
					</p>
					<p class="item">
						<strong>{{ $t('dashboard.node-upload-speed') }}</strong>{{ nodeStore.uploadSpeed }}
					</p>
					<p class="item">
						<strong>{{ $t('dashboard.node-download-speed') }}</strong>{{ nodeStore.downloadSpeed }}
					</p>
				</ion-card-content>
			</ion-card>
				
			<ion-card class="container nobg">
				<ion-card-content>
					<ion-button fill="outline" expand="block" @click="nodeDisconnect">
						{{ $t('dashboard.disconnect-button') }}
					</ion-button>
				</ion-card-content>
			</ion-card>
		</div>
	</ion-content>
</ion-page>
</template>
<style lang="scss" scoped>
@import '@scss/container';
@import '@scss/container';

.dashboard
{
	.bg-blue
	{
		.app-grid
		{
			.app-grid__row
			{
				align-items: flex-start;
			}
		}
	}
}
</style>
