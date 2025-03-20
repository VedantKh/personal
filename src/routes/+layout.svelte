<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/styles/style.scss';
	import 'prismjs/themes/prism.css';
	import { onMount } from 'svelte';
	let { children } = $props();

	// Track mouse position with signals
	let mouseX = $state(0);
	let mouseY = $state(0);

	// Default values for server rendering
	let width = $state(1);
	let height = $state(1);

	// Calculate background color based on mouse position
	let hue = $derived(Math.floor((mouseX / width) * 360));
	let lightness = $derived(60 + Math.floor((mouseY / height) * 35));
	let backgroundColor = $derived(`hsl(${hue}, 70%, ${lightness}%)`);

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

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

<!-- <div
	class="layout"
	role="presentation"
	style:background-color={backgroundColor}
	style:transition="background-color 0.2s ease"
	onmousemove={handleMouseMove}
> -->
<div>
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}
</style>
