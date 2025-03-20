<script lang="ts">
	import type { Post } from '$lib/utils/posts';

	export let posts: Post[];
	export let showHeading = true;
	export let headingText = 'Writings';
</script>

{#snippet postPreview(post: Post)}
	<a href={post.path}>
		<h2>
			{post.meta.title}
		</h2>
		Written on {post.meta.date}
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
