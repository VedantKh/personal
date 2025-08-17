<script lang="ts">
	// Import necessary styles
	import '$lib/styles/style.scss';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let contentDiv: HTMLDivElement;

	onMount(() => {
		// Intercept clicks on internal links
		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Check if the clicked element is a link or is inside a link
			const link = target.closest('a');

			if (link && link.href) {
				const url = new URL(link.href);

				// Check if it's an internal link (same origin)
				if (url.origin === window.location.origin) {
					e.preventDefault();
					goto(url.pathname + url.search + url.hash);
				}
			}
		};

		// Add event listener to the content div
		contentDiv.addEventListener('click', handleClick);

		// Cleanup
		return () => {
			contentDiv?.removeEventListener('click', handleClick);
		};
	});
</script>

<div class="md-content" bind:this={contentDiv}>
	<slot />
</div>

<style lang="scss">
	/* Any component-specific styles could go here */
</style>
