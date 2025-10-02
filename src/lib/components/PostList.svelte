<script lang="ts">
	import type { Post } from '$lib/utils/posts';
	import { analytics } from '$lib/utils/analytics';

	export let posts: Post[];
	export let showHeading = true;
	export let headingText = 'Writings';
	export let showHighlightedTag = true;

	function handlePostClick(post: Post) {
		// Track which posts are being clicked
		analytics.trackSectionEngagement('writings', `clicked: ${post.meta.title}`);
	}
</script>

{#snippet postPreview(post: Post)}
	<a href={post.path} class="post-preview" onclick={() => handlePostClick(post)}>
		<div class="post-header">
			<h2 class="post-title">
				{post.meta.title}
				{#if post.meta.draft === 'yes'}
					<span class="draft-tag">Draft</span>
				{/if}
				{#if showHighlightedTag && post.meta.highlight === 'yes'}
					<span class="highlight-tag">Highlighted</span>
				{/if}
			</h2>
			<span class="post-date">{post.meta.date}</span>
		</div>
		{#if post.meta.description}
			<p class="post-description">{post.meta.description}</p>
		{/if}
	</a>
{/snippet}

{#if showHeading}
	<h1>{headingText}</h1>
{/if}

{#each posts as post}
	{#if post.path}
		{@render postPreview(post)}
	{/if}
{/each}
