<!-- src/routes/[slug]/+page.svelte -->
<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { initReadingTracker, initScrollTracking } from '$lib/utils/analytics';

	let { data }: { data: PageData } = $props();

	// Use $derived to make these reactive to data changes
	const title = $derived(data.title);
	const date = $derived(data.date);
	const Content = $derived(data.Content);
	const description = $derived(data.description);
	const keywords = $derived(data.keywords);
	const tags = $derived(data.tags);
	const image = $derived(data.image);
	const imageAlt = $derived(data.imageAlt);
	const duration = $derived(data.duration);

	// Format date for article:published_time (reactive)
	const publishedTime = $derived(date ? new Date(date).toISOString() : undefined);

	// Format date for display (e.g., "December 21, 2024")
	const formatDisplayDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Track analytics when slug changes
	$effect(() => {
		const slug = $page.params.slug;

		// Initialize reading time tracker
		const cleanupReading = initReadingTracker(slug, title);

		// Initialize scroll depth tracker
		const cleanupScroll = initScrollTracking(`/writings/${slug}`);

		// Cleanup when slug changes or component unmounts
		return () => {
			if (cleanupReading) cleanupReading();
			if (cleanupScroll) cleanupScroll();
		};
	});
</script>

<SEO
	{title}
	{description}
	{keywords}
	type="article"
	{publishedTime}
	section="Writings"
	{tags}
	{image}
	{imageAlt}
/>

<StructuredData type="Article" {title} {description} datePublished={publishedTime} {image} {tags} />

<article class="writing-content">
	<h1 class="post-h1">{title}</h1>
	<p class="post-description">{description}</p>
	<div class="post-meta-container">
		<p>{date ? formatDisplayDate(date) : ''}</p>
		<p><em>{duration}</em></p>
	</div>
	<Content />
</article>

<style>
	article {
		max-width: 100%;
		margin: 0 auto;
	}

	.post-h1 {
		font-size: 2em;
		font-weight: 600;
		line-height: 1.25;
		margin-top: 1.5em;
		margin-bottom: 0em;
		border-bottom: none;
		padding-bottom: 0.3em;
	}

	.post-description {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.post-meta-container {
		display: flex;
		justify-content: space-between;
		margin-bottom: 2rem;
		padding-bottom: 0.5em;
		border-bottom: 1px solid #4a4a4a;
	}

	.post-meta-container p {
		margin: 0;
		padding-right: 0.25em;
	}
</style>
