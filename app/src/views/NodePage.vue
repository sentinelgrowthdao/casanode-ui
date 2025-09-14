<script setup lang="ts">
import {
	IonPage, IonLabel
} from '@/ui';
import { startNetworkMonitorHook } from '@/hooks/NetworkMonitorHook';

// Start the network monitor hook
startNetworkMonitorHook();
</script>

<template>
<ion-page>
	<div class="ion-tabs">
		<router-view />
		<nav class="ion-tab-bar">
			<router-link class="ion-tab-button" :to="{ name: 'NodeDashboard' }">
				<font-awesome-icon :icon="['fas','shield-halved']" />
				<ion-label>{{ $t('app.tab-dashboard') }}</ion-label>
			</router-link>
			<router-link class="ion-tab-button" :to="{ name: 'NodeSettings' }">
				<font-awesome-icon :icon="['fas','gear']" />
				<ion-label>{{ $t('app.tab-settings') }}</ion-label>
			</router-link>
			<router-link class="ion-tab-button" :to="{ name: 'NodeWallet' }">
				<font-awesome-icon :icon="['fas','wallet']" />
				<ion-label>{{ $t('app.tab-wallet') }}</ion-label>
			</router-link>
			<router-link class="ion-tab-button" :to="{ name: 'NodeActions' }">
				<font-awesome-icon :icon="['fas','power-off']" />
				<ion-label>{{ $t('app.tab-actions') }}</ion-label>
			</router-link>
			<router-link class="ion-tab-button" :to="{ name: 'NodeAbout' }">
				<font-awesome-icon :icon="['fas','circle-question']" />
				<ion-label>{{ $t('app.tab-about') }}</ion-label>
			</router-link>
		</nav>
	</div>
</ion-page>
</template>
