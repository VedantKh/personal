<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DynamicBackground from '$lib/components/DynamicBackground.svelte';
	import '$lib/styles/style.scss';
	import 'prismjs/themes/prism.css';
	import { onMount } from 'svelte';
	import { Contact } from 'lucide-svelte';
	let { children } = $props();

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

<svelte:head>
	<title>Vedant Khanna | About, contact, and portfolio</title>
	<meta
		name="description"
		content="Building AI applications for legacy industries, currently studying Math at Stanford."
	/>
	<meta
		name="keywords"
		content="Vedant Khanna, Vedant, Stanford, Mathematics, AI, Silicon Valley"
	/>

	<!-- Open Graph / Social Media -->
	<meta property="og:title" content="Vedant Khanna | Stanford Mathematics Student" />
	<meta
		property="og:description"
		content="Personal website of Vedant Khanna, Stanford Mathematics undergraduate student working on AI applications beyond Silicon Valley."
	/>
	<meta property="og:url" content="https://www.vedant.space/" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Vedant Khanna | Stanford Mathematics Student" />
	<meta
		name="twitter:description"
		content="Personal website of Vedant Khanna, Stanford Mathematics undergraduate student working on AI applications beyond Silicon Valley."
	/>
</svelte:head>

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
