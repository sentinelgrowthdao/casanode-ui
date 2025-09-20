import { createRouter, createWebHistory } from 'vue-router';
import { RouteRecordRaw } from 'vue-router';
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';
import { useAuthStore } from '@/stores/AuthStore';
import { useNodeStore } from '@/stores/NodeStore';
import { getJwtExpiration } from '@/utils/jwt';

const TOKEN_REFRESH_THRESHOLD = 60 * 1000; // 1 minute safety margin
let nodeHydrationPromise: Promise<boolean> | null = null;

async function ensureAuthenticated(): Promise<boolean>
{
	const authStore = useAuthStore();
	let token = authStore.token;
	if (!token)
	{
		return false;
	}

	if (NetworkService.getAuthToken() !== token)
	{
		NetworkService.setAuthToken(token);
	}

	let expiresAt = authStore.expiresAt;
	if (!expiresAt)
	{
		expiresAt = getJwtExpiration(token) ?? null;
		if (expiresAt)
			authStore.setExpiry(expiresAt);
	}

	const now = Date.now();
	if (expiresAt && expiresAt <= now + TOKEN_REFRESH_THRESHOLD)
	{
		const refreshed = await NetworkService.refreshAuth(authStore.refreshToken ?? undefined);
		if (!refreshed || !refreshed.token)
		{
			authStore.clear();
			NetworkService.setAuthToken(null);
			return false;
		}

		token = refreshed.token;
		NetworkService.setAuthToken(token);
		expiresAt = refreshed.expiresAt ?? getJwtExpiration(token) ?? null;
		authStore.setTokens(token, refreshed.refreshToken, expiresAt);
	}

	if (expiresAt && expiresAt <= now)
	{
		authStore.clear();
		NetworkService.setAuthToken(null);
		return false;
	}

	return true;
}

function hasNodeData(): boolean
{
	const nodeStore = useNodeStore();
	return Boolean(nodeStore.nodeIp || nodeStore.moniker);
}

async function ensureNodeData(): Promise<boolean>
{
	if (hasNodeData())
	{
		return true;
	}

	if (!NetworkService.isConnected())
	{
		return false;
	}

	if (!nodeHydrationPromise)
	{
		nodeHydrationPromise = (async () =>
		{
			await NodeService.loadNodeConfiguration();
			return hasNodeData();
		})().finally(() => { nodeHydrationPromise = null; });
	}

	return await nodeHydrationPromise;
}

// List of pages that require connection
export const requiresConnection = [
	'NodeDashboard', 'NodeSettings', 'NodeWallet', 'NodeActions', 'NodeAbout',
	'Wizard1Welcome', 'Wizard1Reset', 'Wizard2Moniker', 'Wizard6Protection', 'Wizard6Passphrase',
	'Wizard7Wallet', 'Wizard7Restore', 'Wizard7Create', 'Wizard8Fund', 'Wizard9Ports',
	'Wizard10Congratulations',
];

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@views/HomePage.vue')
	},
	{
		path: '/connect',
		name: 'ConnectLink',
		component: () => import('@views/ConnectLink.vue')
	},
	{
		path: '/node',
		name: 'Node',
		component: () => import('@views/NodePage.vue'),
		children: [
			{
				path: '',
				redirect: { name: 'NodeDashboard' },
			},
			{
				path: 'dashboard',
				name: 'NodeDashboard',
				component: () => import('@views/Node/DashboardPage.vue'),
			},
			{
				path: 'settings',
				name: 'NodeSettings',
				component: () => import('@views/Node/SettingsPage.vue'),
			},
			{
				path: 'wallet',
				name: 'NodeWallet',
				component: () => import('@views/Node/WalletPage.vue'),
			},
			{
				path: 'actions',
				name: 'NodeActions',
				component: () => import('@views/Node/ActionsPage.vue'),
			},
			{
				path: 'about',
				name: 'NodeAbout',
				component: () => import('@/views/Node/AboutPage.vue')
			},
		],
	},
	{
		path: '/wizard',
		redirect: '/wizard/welcome',
	},
	{
		path: '/wizard/welcome',
		name: 'Wizard1Welcome',
		component: () => import('@views/Wizard/Step1Welcome.vue')
	},
	{
		path: '/wizard/reset',
		name: 'Wizard1Reset',
		component: () => import('@views/Wizard/Step1Reset.vue')
	},
	{
		path: '/wizard/moniker',
		name: 'Wizard2Moniker',
		component: () => import('@views/Wizard/Step2Moniker.vue')
	},
	{
		path: '/wizard/protection',
		name: 'Wizard6Protection',
		component: () => import('@views/Wizard/Step6Protection.vue')
	},
	{
		path: '/wizard/passphrase',
		name: 'Wizard6Passphrase',
		component: () => import('@views/Wizard/Step6Passphrase.vue')
	},
	{
		path: '/wizard/wallet',
		name: 'Wizard7Wallet',
		component: () => import('@views/Wizard/Step7Wallet.vue')
	},
	{
		path: '/wizard/wallet/recover',
		name: 'Wizard7Restore',
		component: () => import('@views/Wizard/Step7Restore.vue')
	},
	{
		path: '/wizard/wallet/create',
		name: 'Wizard7Create',
		component: () => import('@views/Wizard/Step7Create.vue')
	},
	{
		path: '/wizard/wallet/fund',
		name: 'Wizard8Fund',
		component: () => import('@views/Wizard/Step8Fund.vue')
	},
	{
		path: '/wizard/ports',
		name: 'Wizard9Ports',
		component: () => import('@views/Wizard/Step9Ports.vue')
	},
	{
		path: '/wizard/congratulations',
		name: 'Wizard10Congratulations',
		component: () => import('@views/Wizard/Step10Congratulations.vue')
	}
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})


router.beforeEach(async (to, from, next) =>
{
	// If the page requires a connection to the node
	if(requiresConnection.includes(to.name as string))
	{
		const targetName = typeof to.name === 'string' ? to.name : '';
		const isAuthenticated = await ensureAuthenticated();
		if (!isAuthenticated)
		{
			return next({ name: 'Home' });
		}
		// Check if the node is connected
		const isConnected = await NetworkService.isConnected();
		// If not connected, redirect to home
		if (!isConnected)
		{
			return next({ name: 'Home' });
		}
		if (targetName.startsWith('Node'))
		{
			const ready = await ensureNodeData();
			if (!ready)
			{
				try
				{
					const pass = await NetworkService.nodePassphrase();
					if (pass?.required && !pass?.available)
					{
						return next({ name: 'Home' });
					}
					const install = await NetworkService.checkInstallation();
					if (!install?.image || !install?.wallet)
					{
						return next({ name: 'Wizard1Welcome' });
					}
				}
				catch (error)
				{
					console.error('Unable to hydrate node data after auth:', error);
				}
				return next({ name: 'Home' });
			}
		}
	}
	
	// Si tout est en ordre, autorise la navigation
	next();
});

export default router
