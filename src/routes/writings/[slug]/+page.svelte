<!-- src/routes/[slug]/+page.svelte -->
<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
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
	const relatedPosts = $derived(data.relatedPosts);

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
		const slug = $page.params.slug ?? '';

		// Initialize reading time tracker
		const cleanupReading = initReadingTracker(slug, title ?? '');

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
	<p>{description}</p>
	<div class="post-meta-container">
		<p>{date ? formatDisplayDate(date) : ''}</p>
		<p><em>{duration}</em></p>
	</div>
	<Content />

	{#if relatedPosts.length}
		<aside class="related" aria-labelledby="related-heading" data-testid="related-thoughts">
			<h2 id="related-heading">Related thoughts</h2>
			<ul>
				{#each relatedPosts as related (related.slug)}
					<li>
						<a href={resolve('/writings/[slug]', { slug: related.slug })}>{related.title}</a>
						{#if related.description}
							<span class="related-description">{related.description}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
</article>

<style>
	article {
		max-width: 100%;
		margin: 0 auto;
	}

	.related {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid #4a4a4a;
	}

	.related h2 {
		font-size: 1rem;
		margin: 0 0 1rem;
		opacity: 0.7;
	}

	.related ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.related li {
		margin-bottom: 0.75rem;
	}

	.related a {
		text-decoration: none;
	}

	.related a:hover {
		text-decoration: underline;
	}

	.related-description {
		display: block;
		font-size: 0.9rem;
		opacity: 0.6;
	}
</style>
