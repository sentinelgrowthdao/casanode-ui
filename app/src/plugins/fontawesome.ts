import type { App } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
	faShieldHalved,
	faGear,
	faWallet,
	faPowerOff,
	faCircleQuestion,
	faArrowsRotate,
	faCopy,
	faLink,
	faFileLines,
} from '@fortawesome/free-solid-svg-icons';

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

