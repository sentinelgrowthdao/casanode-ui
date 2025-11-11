import { registerFontAwesome } from '@/plugins/fontawesome';
import NetworkService from '@/services/NetworkService';
import { useAuthStore } from '@/stores/AuthStore';
import { IonicVue } from '@/ui';
import { registerUi } from '@/ui/register';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import Notifications from '@kyvg/vue3-notification';
import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
import i18n from './locales';
import router from './router';
import { initSentry } from './utils/sentry';

/* Theme variables */
import './scss/theme/ionic-shim.scss';
import './scss/theme/variables.scss';

/* Initialize Pinia */
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
	.use(IonicVue)
	.use(pinia)
	.use(i18n)
	.use(router)
	.use(Notifications);

// Register Font Awesome globally
registerFontAwesome(app);
// Register UI overrides for ion-page, ion-header, ion-content
registerUi(app);

// Initialize Sentry
initSentry(app, router);

// Attempt to auto-connect API from .env and restore JWT from store for deep-links
try { NetworkService.connect({}); }
catch (e) { /* ignore */ }
setActivePinia(pinia);
const authStore = useAuthStore();
if (authStore.token)
{
	NetworkService.setAuthToken(authStore.token);
}

router.isReady().then(() =>
{
	app.mount('#app');
	// Register service worker (PWA) after app mount
	if ('serviceWorker' in navigator)
	{
		navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('SW registration failed', err));
	}
});
