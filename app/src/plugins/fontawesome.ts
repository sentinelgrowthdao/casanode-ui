import { library } from '@fortawesome/fontawesome-svg-core';
import
{
	faArrowsRotate,
	faCircleQuestion,
	faCopy,
	faFileLines,
	faGear,
	faLink,
	faPowerOff,
	faShieldHalved,
	faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { App } from 'vue';

export function registerFontAwesome(app: App) 
{
	library.add(
		faShieldHalved,
		faGear,
		faWallet,
		faPowerOff,
		faCircleQuestion,
		faArrowsRotate,
		faCopy,
		faLink,
		faFileLines,
	);
	app.component('font-awesome-icon', FontAwesomeIcon);
}

