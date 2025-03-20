Hi! I'm Vedant, I'm currently finishing up my undergrad at Stanford in Math.

I arrived at Stanford determined to be a physicist after I fell in love with the subject as a kid, excited to dive into the big questions and learn from legends like Susskind.

Serendipity is powerful in the Bay though. Through a series of fortunate events, I ended starting my company [Hazel](/experience) with my closest friends when I was 19. That kickstarted the densest learning experience of my life, and permanently changed my trajectory.

There's nothing more intoxicating than working with your favourite people on changing the status quo. However, it requires serious sacrifice, so I realized I need equally serious reasoning about why the status quo is worth changing.

The [Hamming questions](https://www.lesswrong.com/w/hamming-questions#:~:text=Mathematician%20Richard%20Hamming%20used%20to,people's%20attention%20on%20what%20matters.) have been a powerful way to structure this thinking, and I'm actively working on my answer to them.

I've shared my honest thoughts here on various subjects, and I'd love to hear your reactions to them. You can reach me at vedantk@stanford.edu

<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const { posts } = data;
	import PostList from '$lib/components/PostList.svelte';
</script>

<PostList posts="{posts}" />
