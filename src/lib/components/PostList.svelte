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
		<span class="post-date">Written on {post.meta.date}</span>
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
		padding: 1rem;
		margin-bottom: 1.5rem;
		border-radius: 0.5rem;
		background-color: #f9f9f9;
		text-decoration: none;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.post-preview:hover {
		transform: translateY(-3px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}

	.post-title {
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.post-date {
		font-size: 0.9rem;
		color: #666;
	}
</style>
