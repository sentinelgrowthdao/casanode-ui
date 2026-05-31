<script setup lang="ts">
import {
	IonLabel,
	IonPage
} from '@/ui';
</script>

<template>
<ion-page>
	<div class="app-tabs">
		<router-view />
		<nav class="app-tab-bar">
			<router-link class="app-tab-button" :to="{ name: 'NodeDashboard' }" aria-label="Tableau de bord">
				<font-awesome-icon class="tab-icon" :icon="['fas','shield-halved']" />
				<ion-label>{{ $t('app.tab-dashboard') }}</ion-label>
			</router-link>
			<router-link class="app-tab-button" :to="{ name: 'NodeSettings' }" aria-label="Paramètres">
				<font-awesome-icon class="tab-icon" :icon="['fas','gear']" />
				<ion-label>{{ $t('app.tab-settings') }}</ion-label>
			</router-link>
			<router-link class="app-tab-button" :to="{ name: 'NodeWallet' }" aria-label="Portefeuille">
				<font-awesome-icon class="tab-icon" :icon="['fas','wallet']" />
				<ion-label>{{ $t('app.tab-wallet') }}</ion-label>
			</router-link>
			<router-link class="app-tab-button" :to="{ name: 'NodeActions' }" aria-label="Actions">
				<font-awesome-icon class="tab-icon" :icon="['fas','power-off']" />
				<ion-label>{{ $t('app.tab-actions') }}</ion-label>
			</router-link>
			<router-link class="app-tab-button" :to="{ name: 'NodeAbout' }" aria-label="À propos">
				<font-awesome-icon class="tab-icon" :icon="['fas','circle-question']" />
				<ion-label>{{ $t('app.tab-about') }}</ion-label>
			</router-link>
		</nav>
	</div>
</ion-page>
</template>
