<!-- src/routes/[slug]/+page.svelte -->
<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { title, date, Content, description, keywords, tags, image, imageAlt } = data;

	// Format date for article:published_time
	const publishedTime = date ? new Date(date).toISOString() : undefined;
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

<article>
	<h1>{title}</h1>
	<p class="post-date">{date}</p>
	<Content />
</article>

<style>
	article {
		max-width: 100%;
		margin: 0 auto;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.post-date {
		color: var(--text-muted, #999);
		margin-bottom: 2rem;
	}
</style>
