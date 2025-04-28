import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	plugins: [
		nodePolyfills(),
		sveltekit()
	]
});
