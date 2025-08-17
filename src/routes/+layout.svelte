<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DynamicBackground from '$lib/components/DynamicBackground.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import '$lib/styles/style.scss';
	import 'prismjs/themes/prism.css';
	import { onMount } from 'svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { Contact } from 'lucide-svelte';
	import { dev } from '$app/environment';

	let { children } = $props();

	// Inject Vercel Analytics and Speed Insights
	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	// Default values for server rendering
	let width = $state(1);
	let height = $state(1);

	onMount(() => {
		// window code here safely
		width = window.innerWidth;
		height = window.innerHeight;

		// Optional; update on resize
		window.addEventListener('resize', () => {
			width = window.innerWidth;
			height = window.innerHeight;
		});
	});
</script>

<!-- Default SEO for all pages - can be overridden by child pages -->
<SEO />
<StructuredData type="WebSite" />

<div class="page-container">
	<DynamicBackground />

	<Header />

	<div class="site-wrapper">
		<main class="site-content">
			{@render children()}
		</main>
	</div>

	<Footer />
</div>

<style lang="scss">
	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}

	.page-container {
		position: relative;
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.site-wrapper {
		flex: 1;
		position: relative;
		z-index: 1;
		padding-top: 1rem;
		padding-bottom: 1rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.site-content {
		width: 100%;
		max-width: 40rem;
		display: flex;
		flex-direction: column;
		padding: 0 1rem;
	}

	:global(header) {
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(5px);
		background-color: rgba(26, 26, 26, 0.5);
	}

	:global(footer) {
		position: sticky;
		bottom: 0;
		z-index: 10;
		backdrop-filter: blur(5px);
		background-color: rgba(26, 26, 26, 0.5);
	}
</style>
