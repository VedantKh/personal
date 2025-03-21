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

<DynamicBackground>
	<div class="site-wrapper">
		<Header />

		<main class="site-content">
			{@render children()}
		</main>

		<Footer />
	</div>
</DynamicBackground>

<style lang="scss">
	.site-wrapper {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
		min-height: 100vh;
		z-index: 1;
		position: relative;
		overflow-y: auto;
	}

	.site-content {
		flex: 1;
		overflow-y: auto;
	}
</style>
