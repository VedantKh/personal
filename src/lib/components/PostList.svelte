<script lang="ts">
	export let posts: {
		path: string;
		meta: {
			title: string;
			date: string;
		};
	}[];
	export let showHeading = true;
	export let headingText = 'writings';
</script>

{#if showHeading}
	<h1>{headingText}</h1>
{/if}

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
