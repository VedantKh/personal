<!-- src/routes/writings/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { onMount } from 'svelte';
	import { initScrollTracking, analytics } from '$lib/utils/analytics';

	export let data: PageData;
	const { posts } = data;

	// Track page view and scroll depth
	onMount(() => {
		analytics.trackSectionEngagement('writings', 'list_view');
		const cleanup = initScrollTracking('/writings');
		return cleanup;
	});
</script>

<SEO
	title="Writings"
	description="My thoughts :)"
	keywords="blog, writings, essays, startup advice, fundraising, Silicon Valley, AI, entrepreneurship, Vedant Khanna"
/>

<StructuredData type="WebPage" title="Writings - Vedant Khanna" description="My thoughts :)" />

<PostList {posts} />
