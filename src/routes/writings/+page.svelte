<!-- src/routes/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const { posts } = data;
</script>

<h1>writings</h1>

<ul>
	{#each posts as post}
		<h2>
			<a href={post.path}>
				{post.meta.title}
			</a>
		</h2>
		Published {post.meta.date}
	{/each}
</ul>
