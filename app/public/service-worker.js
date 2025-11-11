/* Basic service worker for Casanode */
const CACHE_NAME = 'casanode-shell-v1';
const CORE_ASSETS = [
	'/',
	'/index.html',
	'/site.webmanifest',
	'/favicon-32x32.png',
	'/favicon-16x16.png',
];

self.addEventListener('install', (event) => 
{
	event.waitUntil(
		(async () => 
		{
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(CORE_ASSETS);
		})()
	);
});

self.addEventListener('activate', (event) => 
{
	event.waitUntil(
		(async () => 
		{
			const keys = await caches.keys();
			await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
			self.clients.claim();
		})()
	);
});

// Cache-first for same-origin static, network-first fallback
self.addEventListener('fetch', (event) => 
{
	const req = event.request;
	const url = new URL(req.url);
	if (url.origin === location.origin) 
	{
		// API calls should bypass cache (heuristic: /api/ path)
		if (/\/api\//.test(url.pathname)) 
		{
			return; // default fetch
		}
		event.respondWith(
			(async () => 
			{
				const cache = await caches.open(CACHE_NAME);
				const cached = await cache.match(req);
				if (cached) return cached;
				const res = await fetch(req);
				if (res.ok && req.method === 'GET') 
				{
					cache.put(req, res.clone());
				}
				return res;
			})()
		);
	}
});
