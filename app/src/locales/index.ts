import { createI18n } from 'vue-i18n';

// English
import AboutEn from '@locales/en/about.json';
import ActionsEn from '@locales/en/actions.json';
import AppEn from '@locales/en/app.json';
import ConnectEn from '@locales/en/connect.json';
import DashboardEn from '@locales/en/dashboard.json';
import HomepageEn from '@locales/en/homepage.json';
import LoadingEn from '@locales/en/loading.json';
import SettingsEn from '@locales/en/settings.json';
import WalletEn from '@locales/en/wallet.json';
import WelcomeEn from '@locales/en/welcome.json';
import WizardEn from '@locales/en/wizard.json';

// French
import AboutFr from '@locales/fr/about.json';
import ActionsFr from '@locales/fr/actions.json';
import AppFr from '@locales/fr/app.json';
import ConnectFr from '@locales/fr/connect.json';
import DashboardFr from '@locales/fr/dashboard.json';
import HomepageFr from '@locales/fr/homepage.json';
import LoadingFr from '@locales/fr/loading.json';
import SettingsFr from '@locales/fr/settings.json';
import WalletFr from '@locales/fr/wallet.json';
import WelcomeFr from '@locales/fr/welcome.json';
import WizardFr from '@locales/fr/wizard.json';

interface Option
{
	libelle: string;
	value: string;
}

interface MessageFile
{
	[key: string]:
	{
		[key: string]:
		{
			[key: string]: string | Option[];
		} | Option[];
	};
}

const messages : MessageFile =
{
	en:
	{
		"app": AppEn,
		"welcome": WelcomeEn,
		"wizard": WizardEn,
		"dashboard": DashboardEn,
		"about": AboutEn,
		"wallet": WalletEn,
		"actions": ActionsEn,
		"settings": SettingsEn,
		"loading": LoadingEn,
		"connect": ConnectEn,
		"homepage": HomepageEn,
	},
	fr:
	{
		"app": AppFr,
		"welcome": WelcomeFr,
		"wizard": WizardFr,
		"dashboard": DashboardFr,
		"about": AboutFr,
		"wallet": WalletFr,
		"actions": ActionsFr,
		"settings": SettingsFr,
		"loading": LoadingFr,
		"connect": ConnectFr,
		"homepage": HomepageFr,
	},
};


/**
 * Get the locale language
 * @returns {Promise<string>}
 */
export async function localeLanguage(): Promise<string>
{
	return navigator.language.split('-')[0] || 'en';
}

// Create a new i18n instance with a default locale
const i18n = createI18n({
	locale: 'en',
	fallbackLocale: 'en',
	messages: messages
});

// Best-effort async locale init without blocking app bootstrap
localeLanguage().then((loc) =>
{
	try
	{
		i18n.global.locale = loc;
	}
	catch (e)
	{
		if (import.meta.env.DEV) console.warn('Failed to set locale', e);
	}
});

export default i18n;
