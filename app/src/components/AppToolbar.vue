<script setup lang="ts">
import NetworkService from '@/services/NetworkService';
import { IonButton, IonButtons, IonTitle, IonToolbar } from '@/ui';
import { refreshNodeStatus } from '@/utils/node';
import { useNodeStore } from '@stores/NodeStore';
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// Import pictures
import statusError from '@assets/icons/status-error.svg';
import statusRunning from '@assets/icons/status-running.svg';
import statusStopped from '@assets/icons/status-stopped.svg';

// Use the router and the node store
const router = useRouter();
const nodeStore = useNodeStore();

// Status update interval ID
let statusUpdateTimeout: number | null = null;

// Computed the status image
const statusImage = computed(() =>
{
	switch (nodeStore.status)
	{
		case 'running':
			return statusRunning;
		case 'stopped':
			return statusStopped;
		default:
			return statusError;
	}
});

/**
 * Start periodic status updates
 */
const startStatusUpdate = () =>
{
	const updateStatus = async () =>
	{
		try
		{
			await refreshNodeStatus();
		}
		catch (error)
		{
			console.error('Failed to update node status:', error);
		}
		finally
		{
			// Schedule next update in 30 seconds
			statusUpdateTimeout = window.setTimeout(updateStatus, 30000);
		}
	};

	// Start first update
	updateStatus();
};

/**
 * Stop periodic status updates
 */
const stopStatusUpdate = () =>
{
	if (statusUpdateTimeout)
	{
		clearTimeout(statusUpdateTimeout);
		statusUpdateTimeout = null;
	}
};

// Start status updates when component is mounted
onMounted(() =>
{
	startStatusUpdate();
});

// Stop status updates when component is unmounted
onUnmounted(() =>
{
	stopStatusUpdate();
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
<ion-toolbar>
	<ion-buttons slot="start">
		<ion-button fill="clear" class="logo" @click="nodeDisconnect">
			<img class="logo" src="@assets/images/casanode-logo.png" alt="Casanode" />
		</ion-button>
	</ion-buttons>
	<ion-title>{{ nodeStore.moniker }}</ion-title>
	<ion-buttons slot="end">
		<ion-button fill="clear" @click="refreshNodeStatus">
			<img :src="statusImage" alt="Status" />
		</ion-button>
	</ion-buttons>
</ion-toolbar>
</template>

<style lang="scss" scoped>
.logo
{
	--border-width: 0;
	--box-shadow: none;
	--background: transparent;
	--background-focused: transparent;
	--background-activated: transparent;

	&>img
	{
		display: inline-block;
		height: 3rem;
	}
}

ion-title
{
	text-align: center;
}

ion-button img
{
	height: 1.5rem;
}
</style>