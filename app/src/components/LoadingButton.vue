<script setup lang="ts">
import { IonButton, IonSpinner } from '@/ui';
import { ref } from 'vue';

interface Props
{
	label: string;
	callback: () => Promise<void>;
}

const props = defineProps<Props>();
const loading = ref(false);

const handleClick = async () =>
{
	// Show the loading spinner
	loading.value = true;
	try
	{
		// Call the callback function
		await props.callback();
	}
	finally
	{
		// Hide the loading spinner
		loading.value = false;
	}
};
</script>
<template>
<ion-button @click="handleClick" :disabled="loading" expand="block" :class="{ loading: loading }">
	<div class="button-content">
		<ion-spinner v-if="loading" name="crescent" slot="start" />
		<span>{{ label }}</span>
	</div>
</ion-button>
</template>
<style scoped lang="scss">
ion-button
{
	display: flex;
	justify-content: center;
	align-items: center;
	
	&.ion-color-danger
	{
		&> .button-content > span
		{
			color:var(--text-color-normal-light);
		}
	}
	
	.button-content
	{
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		white-space: nowrap;
		line-height: 1.2;

		/* Target shim spinner element rendered as <span class="ion-spinner"> */
		:deep(.ion-spinner)
		{
			width: 1rem;
			height: 1rem;
			display: inline-block;
			vertical-align: middle;
		}
	}
	
	&.loading .button-content
	{
		width: 100%;
		justify-content: center;
	}
}
</style>
