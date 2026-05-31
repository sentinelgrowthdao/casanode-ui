import { registerFontAwesome } from '@/plugins/fontawesome';
import NetworkService from '@/services/NetworkService';
import { useAuthStore } from '@/stores/AuthStore';
import { UiPlugin } from '@/ui';
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

/* Theme variables */
import './scss/theme/ui-shim.scss';
import './scss/theme/variables.scss';

/* Initialize Pinia */
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
setActivePinia(pinia);

const app = createApp(App)
	.use(UiPlugin)
	.use(pinia)
	.use(i18n)
	.use(router)
	.use(Notifications);

// Register Font Awesome globally
registerFontAwesome(app);
// Register app shell components used across the views
registerUi(app);

// Attempt to auto-connect API from .env and restore JWT from store for deep-links
try { NetworkService.connect({}); }
catch { /* ignore */ }
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
