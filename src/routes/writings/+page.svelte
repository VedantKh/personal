<!-- src/routes/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';
	export let data: PageData;
	const { posts } = data;
</script>


<PostList {posts} />
