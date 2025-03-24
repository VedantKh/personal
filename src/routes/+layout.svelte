<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DynamicBackground from '$lib/components/DynamicBackground.svelte';
	import '$lib/styles/style.scss';
	import 'prismjs/themes/prism.css';
	import { onMount } from 'svelte';
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

<div class="page-container">
	<DynamicBackground />

	<div class="site-wrapper">
		<Header />

		<main class="site-content">
			{@render children()}
		</main>

		<Footer />
	</div>
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
	}

	.site-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
		z-index: 1;
	}

	.site-content {
		flex: 1;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-self: center;
		padding: 1rem;
	}
</style>
