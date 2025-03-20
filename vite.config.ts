import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 3000
	},
	optimizeDeps: {
		exclude: ['@sveltejs/kit', 'svelte', '$app/environment', '$app/navigation', '$app/stores']
	}
});
