<script lang="ts">
	// Import necessary styles
	import '$lib/styles/style.scss';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { analytics, initScrollTracking } from '$lib/utils/analytics';
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';

	let contentDiv: HTMLDivElement;

	// Get page metadata if available
	$: metadata = $page.data?.metadata || {};
	$: pathname = $page.url.pathname;
	$: sectionName = pathname.split('/')[1] || 'page';

	onMount(() => {
		// Initialize analytics for this page
		analytics.trackSectionEngagement(sectionName, 'view');
		const cleanupScroll = initScrollTracking(pathname);

		// Intercept clicks on internal links
		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;

			// Check if the clicked element is a link or is inside a link
			const link = target.closest('a');

			if (link && link.href) {
				const url = new URL(link.href);

				// Track demo clicks (links with data-project attribute)
				const projectName = link.getAttribute('data-project');
				if (projectName && url.origin !== window.location.origin) {
					analytics.trackDemoClick(projectName, link.href);
				}

				// Track external link clicks
				if (url.origin !== window.location.origin) {
					const label = link.textContent || 'Unknown';
					analytics.trackExternalLink(link.href, label, 'resource');
				}

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
			if (cleanupScroll) cleanupScroll();
		};
	});
</script>

<!-- SEO components for markdown pages -->
{#if metadata.title}
	<SEO
		title={metadata.title}
		description={metadata.description}
		keywords={metadata.keywords}
		type="article"
	/>
	<StructuredData
		type="WebPage"
		title={`${metadata.title} - Vedant Khanna`}
		description={metadata.description}
	/>
{/if}

<div class="md-content" bind:this={contentDiv}>
	<slot />
</div>

<style lang="scss">
	/* Any component-specific styles could go here */
</style>
