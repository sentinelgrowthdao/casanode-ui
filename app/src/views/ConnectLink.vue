<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConnectionStore } from '@/stores/ConnectionStore';

const route = useRoute();
const router = useRouter();
const status = ref('');

onMounted(() =>
{
	try
	{
		const q: any = route.query || {};
		const ip = (q.ip || q.host || '').trim();
		const portRaw = q.port || q.p || '';
		const token = (q.key || q.token || '').trim();

		if (!ip || !portRaw)
		{
			status.value = 'Missing ip or port in URL.';
		}
		else
		{
			const port = parseInt(portRaw, 10);
			if (!Number.isFinite(port) || port <= 0 || port > 65535)
			{
				status.value = 'Invalid port.';
			}
			else
			{
				// Basic IP / hostname sanity (very loose)
				if (!/^[A-Za-z0-9_.:-]+$/.test(ip))
				{
					status.value = 'Invalid host/ip.';
				}
				else
				{
					const connectionStore = useConnectionStore();
					connectionStore.setConnection(ip, port, token || null);
					status.value = 'Parameters saved. Redirecting…';
					// Use replace to avoid query params in history
					router.replace({ name: 'Home' });
					return;
				}
			}
		}
	}
	catch (e: any)
	{
		status.value = e?.message || 'Unexpected error.';
	}
	// On error still go home after brief delay
	setTimeout(() => router.replace({ name: 'Home' }), 1500);
});
</script>

<template>
<div style="display:flex;min-height:60vh;align-items:center;justify-content:center;font-family:sans-serif;">
	<p>{{ status || 'Processing…' }}</p>
</div>
</template>

<style scoped>
p { color: #999; font-size: .95rem; }
</style>