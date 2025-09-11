import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs';
import { defineConfig } from 'vite'

// Check if the qrdata.json file exists
const qrcodePath = path.resolve(__dirname, './src/assets/qrcode.json');
const qrcodeAliasPath = fs.existsSync(qrcodePath) ? qrcodePath : path.resolve(__dirname, './src/assets/qrcode.example.json');
let proxyTarget: string | undefined = undefined;
try 
{
	const raw = fs.readFileSync(qrcodeAliasPath, 'utf-8');
	const data = JSON.parse(raw || '{}');
	if (data?.ip && (data?.apiPort || data?.apiPort === 0)) 
	{
		proxyTarget = `https://${data.ip}:${data.apiPort}`;
	}
}
catch (e) 
{
	// Log the error for debugging and continue with default behavior
	// (avoid silent empty catch blocks)
	console.warn('Failed to read or parse qrcode config:', e);
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		legacy()
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@locales': path.resolve(__dirname, './src/locales'),
			'@assets': path.resolve(__dirname, './src/assets'),
			'@components': path.resolve(__dirname, './src/components'),
			'@views': path.resolve(__dirname, './src/views'),
			'@scss': path.resolve(__dirname, './src/scss'),
			'@services': path.resolve(__dirname, './src/services'),
			'@stores': path.resolve(__dirname, './src/stores'),
			'@interfaces': path.resolve(__dirname, './src/interfaces'),
			'@qrcode.json': qrcodeAliasPath,
		},
	},
	server: {
		proxy: proxyTarget
			? {
				'/api/v1': {
					target: proxyTarget,
					changeOrigin: true,
					secure: false,
				},
			}
			: undefined,
	},
	// test: {
	// 	globals: true,
	// 	environment: 'jsdom'
	// }
})
