<script lang="ts" setup>
import NetworkService from '@/services/NetworkService';
import { useAuthStore } from '@/stores/AuthStore';
import { IonButton, IonContent, IonPage, IonSpinner } from '@/ui';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');
const reachability = ref<'unknown' | 'ok' | 'fail'>('unknown');
const checkingReachability = ref(false);
const canInstall = ref(false);
let deferredPrompt: any = null;

// Parsed (hidden) parameters
let ip: string | null = null;
let port: number | null = null;
let preShared: string | null = null;
const endpointReady = ref(false);
const autoTried = ref(false);

window.addEventListener('beforeinstallprompt', (e: Event) =>
{
	e.preventDefault();
	deferredPrompt = e;
	canInstall.value = true;
});

function parseAndStore(): void
{
	try
	{
		const q: any = route.query || {};
		const h = (q.ip || q.host || '').trim();
		const pRaw = (q.port || q.p || '').trim();
		const key = (q.key || q.token || '').trim();
		if (!h || !pRaw) throw new Error('Lien incomplet');
		const pNum = parseInt(pRaw, 10);
		if (!Number.isFinite(pNum) || pNum <= 0 || pNum > 65535) throw new Error('Port invalide');
		if (!/^[A-Za-z0-9_.:-]+$/.test(h)) throw new Error('Hôte invalide');
		ip = h; port = pNum; preShared = key || null;
		// Persist silently for PWA first-launch bootstrap
		localStorage.setItem('casanode_pending_endpoint', JSON.stringify({ ip, port, preShared }));
		endpointReady.value = true;
	}
	catch (e: any)
	{
		error.value = 'Lien de connexion invalide.'; // Generic, no leak
	}
}

onMounted(async () =>
{
	parseAndStore();
	// Auto attempt if we already possess a valid auth token and endpoint saved previously
	await tryAutoLogin();
});

async function tryAutoLogin(): Promise<void>
{
	if (autoTried.value || loading.value) return;
	// Recover pending endpoint if not parsed yet
	if (!endpointReady.value)
	{
		try
		{
			const raw = localStorage.getItem('casanode_pending_endpoint');
			if (raw)
			{
				const parsed = JSON.parse(raw);
				if (parsed?.ip && parsed?.port)
				{
					ip = parsed.ip; port = parsed.port; preShared = parsed.preShared || null; endpointReady.value = true;
				}
			}
		}
		catch {/* ignore */}
	}

	if (!endpointReady.value) return;

	// Attempt a cheap reachability probe (unauthenticated) before deciding UX.
	if (reachability.value === 'unknown')
	{
		checkingReachability.value = true;
		try
		{
			// Use a basic fetch to /api/v1/status (should be public enough to 401 or return status)
			const controller = new AbortController();
			setTimeout(() => controller.abort(), 4000);
			const resp = await fetch(`http://${ip}:${port}/api/v1/status`, { method: 'GET', signal: controller.signal });
			reachability.value = resp.ok || resp.status === 401 ? 'ok' : 'fail';
		}
		catch
		{
			reachability.value = 'fail';
		}
		finally { checkingReachability.value = false; }
	}

	// If node not reachable, do not attempt auto behaviors (show guidance instead)
	if (reachability.value === 'fail') return;

	// Detect standalone PWA context (computed early for combined logic)
	const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone;

	// Condition 1: already authenticated AND standalone → skip screen
	if (isStandalone && authStore.token && authStore.lastIp === ip && authStore.lastPort === port)
	{
		autoTried.value = true;
		router.replace({ name: 'Home' });
		return;
	}

	// Condition 2: standalone + preShared token (first pairing) → silent login
	if (isStandalone && preShared)
	{
		try
		{
			autoTried.value = true;
			loading.value = true;
			const connected = await NetworkService.connect({ ip: ip!, port: port! });
			if (connected)
			{
				const res = await NetworkService.login(preShared);
				if (res?.token)
				{
					authStore.setTokens(res.token, res.refreshToken, res.expiresAt ?? null);
					authStore.setLastEndpoint(ip!, port!);
					NetworkService.setAuthToken(res.token);
					localStorage.removeItem('casanode_pending_endpoint');
					router.replace({ name: 'Home' });
					return;
				}
			}
		}
		catch { /* silent */ }
		finally { loading.value = false; }
	}
}

async function installPwa(): Promise<void>
{
	if (!deferredPrompt) return;
	deferredPrompt.prompt();
	try { await deferredPrompt.userChoice; }
	finally
	{
		deferredPrompt = null; canInstall.value = false;
		// After install prompt, attempt auto login again (user may launch from standalone)
		setTimeout(() => { tryAutoLogin(); }, 300);
	}
}

async function connectNow(): Promise<void>
{
	if (loading.value || !endpointReady.value || !ip || !port) return;
	loading.value = true; error.value='';
	try
	{
		const ok = await NetworkService.connect({ ip, port });
		if (!ok) throw new Error('Connexion impossible');
		if (preShared)
		{
			const res = await NetworkService.login(preShared);
			if (res?.token)
			{
				authStore.setTokens(res.token, res.refreshToken, res.expiresAt ?? null);
				authStore.setLastEndpoint(ip, port);
				NetworkService.setAuthToken(res.token);
				localStorage.removeItem('casanode_pending_endpoint');
			}
		}
		// Aller sur home (même si pas de JWT si token manquant, la home redirigera ou affichera message)
		router.replace({ name: 'Home' });
	}
	catch (e: any)
	{
		error.value = 'Échec de connexion.'; // neutre
	}
	finally { loading.value = false; }
}
</script>

<template>
<ion-page>
	<ion-content class="connect-page" :fullscreen="true">
		<div class="wrapper">
			<div class="logo"><img src="@assets/images/casanode-logo.png" alt="Casanode" /></div>
			<h1>{{ $t('connect.welcome-title') }}</h1>
			<p class="intro">{{ $t('connect.welcome-intro') }}</p>
			<p v-if="reachability==='fail'" class="warn">{{ $t('connect.unreachable-hint') }}</p>
			<p v-else-if="reachability==='unknown' && checkingReachability" class="hint">{{ $t('connect.reachability-checking') }}</p>
			<div class="actions">
				<ion-button :disabled="!endpointReady || loading || !canInstall" fill="outline" @click="installPwa">{{ $t('connect.install-button') }}</ion-button>
				<ion-button :disabled="!endpointReady || loading" @click="connectNow">
					<ion-spinner v-if="loading" name="crescent" />
					<span v-else>{{ $t('connect.connect-now') }}</span>
				</ion-button>
			</div>
			<p v-if="!endpointReady && !error" class="hint">{{ $t('connect.loading-link') }}</p>
			<p v-if="error" class="error">{{ $t('connect.error-generic') }}</p>
			<p class="hotspot-help">{{ $t('connect.hotspot-instruction') }}</p>
		</div>
	</ion-content>
</ion-page>
</template>

<style scoped>
.wrapper { display:flex; flex-direction:column; gap:1.25rem; margin:2.5rem auto; max-width:480px; padding:0 1.25rem; text-align:center; }
.logo img { display:block; margin:0 auto 1rem; max-width:140px; }
h1 { font-size:1.9rem; margin:0; }
.intro { color:#bbb; font-size:.95rem; line-height:1.4; }
.actions { display:flex; flex-direction:column; gap:.75rem; margin-top:.5rem; }

@media (width >=460px){ .actions { flex-direction:row; justify-content:center; } }
.hint { color:#888; font-size:.8rem; }
.error { color:#f77; font-size:.85rem; }
.warn { color:#ffb347; font-size:.85rem; }
.hotspot-help { color:#555; font-size:.65rem; line-height:1.3; margin-top:1.5rem; }
</style>