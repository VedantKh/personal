<script lang="ts">
	import type { Post } from '$lib/utils/posts';

	export let posts: Post[];
	export let showHeading = true;
	export let headingText = 'Writings';
</script>

{#snippet postPreview(post: Post)}
	<a href={post.path} class="post-preview">
		<h2 class="post-title">
			{post.meta.title}
		</h2>
		<span class="post-date">{post.meta.date}</span>
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

<style>
	.post-preview {
		display: block;
		padding: 0.75rem 0;
		margin-bottom: 1rem;
		text-decoration: none;
		border-bottom: 1px solid #eaeaea;
		opacity: 0.9;
		transition:
			opacity 0.2s ease,
			transform 0.3s ease,
			padding-left 0.3s ease;
		position: relative;
	}

	.post-preview:hover {
		opacity: 1;
	}

	.post-preview::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		width: 0;
		height: 2px;
		background-color: var(--text-color, #eaeaea);
		transition: width 0.3s ease;
	}

	.post-preview:hover::after {
		width: 100%;
	}

	.post-title {
		margin: 0 0 0.25rem 0;
		color: var(--text-color, #eaeaea);
		font-size: 1.2rem;
		transition: color 0.3s ease;
	}

	.post-date {
		font-size: 0.85rem;
		color: var(--text-muted, #eaeaea);
		font-weight: 300;
		transition: color 0.3s ease;
	}

	.post-preview:hover .post-title {
		color: var(--accent-color, #ffffff);
	}

	.post-preview:hover .post-date {
		color: var(--accent-muted, #cccccc);
	}
</style>
